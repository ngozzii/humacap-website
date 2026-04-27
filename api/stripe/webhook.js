import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sanitizeUuidField } from '../_lib/validation.js';
import { getRequestId, logInfo, logError } from '../_lib/logger.js';

const COURSE_PRICING = {
  'pharm-osce': { amount: 119500, currency: 'cad' },
  'tech-osce': { amount: 95000, currency: 'cad' },
  'pharm-math': { amount: 29900, currency: 'cad' },
  'biz-audit': { amount: 149500, currency: 'cad' },
  'biz-roadmap': { amount: 495000, currency: 'cad' },
  'biz-partnership': { amount: 250000, currency: 'cad' },
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const isJsonRequest = (req) => (req.headers['content-type'] || '').includes('application/json');
const isDuplicateKeyError = (error) =>
  error?.code === '23505' ||
  (typeof error?.message === 'string' && error.message.toLowerCase().includes('duplicate key'));
const sanitizeFailurePayload = (payload = {}) => ({
  request_id: payload.request_id || null,
  session_id: payload.session_id || null,
  user_id: payload.user_id || null,
  course_id: payload.course_id || null,
  expected_amount: payload.expected_amount ?? null,
  actual_amount: payload.actual_amount ?? null,
  reason: payload.reason || null,
});
const persistWebhookFailure = async ({ stripeEventId = null, eventType = null, errorType, payload = {} }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return;

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    await supabase.from('webhook_failures').insert({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      error_type: errorType,
      payload: sanitizeFailurePayload(payload),
    });
  } catch (_err) {
    // Best-effort persistence only; never block webhook response.
  }
};

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!isJsonRequest(req)) {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return res.status(500).json({ ok: false, error: 'Invalid request' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string' || signature.length > 1024) {
    logError('webhook_missing_signature', {
      request_id: requestId,
      endpoint: '/api/stripe/webhook',
    });
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
  let event;

  try {
    const rawBody = await readRawBody(req);
    if (!rawBody?.length) {
      return res.status(400).json({ ok: false, error: 'Invalid request' });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (_error) {
    logError('webhook_signature_verification_failed', {
      request_id: requestId,
      endpoint: '/api/stripe/webhook',
      reason: 'invalid_signature_or_payload',
    });
    await persistWebhookFailure({
      errorType: 'signature_verification_failed',
      payload: {
        request_id: requestId,
        reason: 'invalid_signature_or_payload',
      },
    });
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const eventDataObject = event?.data?.object;
  const metadataRequestId =
    typeof eventDataObject?.metadata?.request_id === 'string' && eventDataObject.metadata.request_id.trim()
      ? eventDataObject.metadata.request_id.trim()
      : requestId;

  logInfo('webhook_event_received', {
    request_id: metadataRequestId,
    event_type: event.type,
    stripe_event_id: event.id,
  });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    try {
      const { data: existingEvent, error: existingEventError } = await supabase
        .from('stripe_events_processed')
        .select('id')
        .eq('id', event.id)
        .maybeSingle();

      if (existingEventError) {
        throw existingEventError;
      }

      if (existingEvent) {
        logInfo('webhook_event_duplicate_ignored', {
          request_id: metadataRequestId,
          event_type: event.type,
          stripe_event_id: event.id,
        });
        return res.status(200).json({ ok: true, received: true });
      }

      const { error: insertEventError } = await supabase
        .from('stripe_events_processed')
        .insert({ id: event.id });
      if (insertEventError) {
        if (isDuplicateKeyError(insertEventError)) {
          logInfo('webhook_event_duplicate_ignored', {
            request_id: metadataRequestId,
            event_type: event.type,
            stripe_event_id: event.id,
          });
          return res.status(200).json({ ok: true, received: true });
        }
        throw insertEventError;
      }
    } catch (_err) {
      logError('webhook_event_dedup_check_failed', {
        request_id: metadataRequestId,
        event_type: event.type,
        stripe_event_id: event.id,
      });
      await persistWebhookFailure({
        stripeEventId: event.id,
        eventType: event.type,
        errorType: 'event_idempotency_check_failed',
        payload: {
          request_id: metadataRequestId,
          reason: 'stripe_events_processed_lookup_insert_failed',
        },
      });
      return res.status(500).json({ ok: false, error: 'Invalid request' });
    }
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ ok: true, received: true });
  }

  const session = event.data.object;
  const rawUserId = typeof session.metadata?.user_id === 'string' ? session.metadata.user_id.trim() : '';
  const userIdField = sanitizeUuidField(rawUserId, { fieldName: 'user_id' });
  const metadataUserId = userIdField.ok ? userIdField.value : null;
  const rawCourseId = typeof session.metadata?.course_id === 'string' ? session.metadata.course_id.trim() : '';
  const metadataCourseId = rawCourseId.length > 0 ? rawCourseId : null;
  const amountTotal = session.amount_total || null;
  const actualCurrency = typeof session.currency === 'string' ? session.currency.toLowerCase() : null;
  const paymentStatus = typeof session.payment_status === 'string' ? session.payment_status.toLowerCase() : null;

  if (!metadataUserId || !metadataCourseId) {
    logError('webhook_invalid_metadata', {
      request_id: metadataRequestId,
      user_id: rawUserId || null,
      course_id: rawCourseId || null,
      stripe_event_id: event.id,
    });
    await persistWebhookFailure({
      stripeEventId: event.id,
      eventType: event.type,
      errorType: 'invalid_metadata',
      payload: {
        request_id: metadataRequestId,
        session_id: session.id,
        user_id: rawUserId || null,
        course_id: rawCourseId || null,
      },
    });
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  if (paymentStatus !== 'paid') {
    logError('webhook_payment_not_paid', {
      request_id: metadataRequestId,
      payment_status: paymentStatus,
      stripe_event_id: event.id,
    });
    await persistWebhookFailure({
      stripeEventId: event.id,
      eventType: event.type,
      errorType: 'payment_not_paid',
      payload: {
        request_id: metadataRequestId,
        session_id: session.id,
        user_id: metadataUserId,
        course_id: metadataCourseId,
        reason: `payment_status_${paymentStatus || 'unknown'}`,
      },
    });
    return res.status(200).json({ ok: true, received: true });
  }

  if (metadataCourseId.length > 64 || !COURSE_PRICING[metadataCourseId]) {
    logError('webhook_invalid_metadata_course', {
      request_id: metadataRequestId,
      event_type: event.type,
      stripe_event_id: event.id,
      session_id: session.id,
      user_id: metadataUserId,
      course_id: rawCourseId || null,
    });
    await persistWebhookFailure({
      stripeEventId: event.id,
      eventType: event.type,
      errorType: 'invalid_course_metadata',
      payload: {
        request_id: metadataRequestId,
        session_id: session.id,
        user_id: metadataUserId,
        course_id: rawCourseId || null,
      },
    });
    return res.status(200).json({ ok: true, received: true });
  }

  const expectedAmount = COURSE_PRICING[metadataCourseId]?.amount;
  const expectedCurrency = COURSE_PRICING[metadataCourseId]?.currency || null;
  if (!expectedCurrency || !actualCurrency || actualCurrency !== expectedCurrency) {
    logError('webhook_currency_mismatch', {
      request_id: metadataRequestId,
      expected_currency: expectedCurrency,
      actual_currency: actualCurrency,
      course_id: metadataCourseId,
      stripe_event_id: event.id,
    });
    await persistWebhookFailure({
      stripeEventId: event.id,
      eventType: event.type,
      errorType: 'currency_mismatch',
      payload: {
        request_id: metadataRequestId,
        session_id: session.id,
        user_id: metadataUserId,
        course_id: metadataCourseId,
        reason: `expected_${expectedCurrency || 'unknown'}_got_${actualCurrency || 'unknown'}`,
      },
    });
    return res.status(200).json({ ok: true, received: true });
  }

  if (!expectedAmount || amountTotal !== expectedAmount) {
    logError('webhook_amount_mismatch', {
      request_id: metadataRequestId,
      expected_amount: expectedAmount ?? null,
      actual_amount: amountTotal,
      course_id: metadataCourseId,
      stripe_event_id: event.id,
    });
    await persistWebhookFailure({
      stripeEventId: event.id,
      eventType: event.type,
      errorType: 'amount_mismatch',
      payload: {
        request_id: metadataRequestId,
        session_id: session.id,
        user_id: metadataUserId,
        course_id: metadataCourseId,
        expected_amount: expectedAmount ?? null,
        actual_amount: amountTotal,
      },
    });
    return res.status(200).json({ ok: true, received: true });
  }

  logInfo('webhook_checkout_session_completed', {
    request_id: metadataRequestId,
    event_type: event.type,
    stripe_event_id: event.id,
    session_id: session.id,
    user_id: metadataUserId,
    course_id: metadataCourseId,
  });

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    try {
      const { data: existingPurchase, error: existingPurchaseError } = await supabase
        .from('purchases')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle();

      if (existingPurchaseError) {
        throw existingPurchaseError;
      }

      if (!existingPurchase) {
        try {
          const { error: insertError } = await supabase.from('purchases').insert({
            user_id: metadataUserId,
            course_id: metadataCourseId,
            stripe_session_id: session.id,
            amount: amountTotal,
          });
          if (insertError) {
            throw insertError;
          }
          logInfo('purchase_recorded', {
            request_id: metadataRequestId,
            user_id: metadataUserId,
            course_id: metadataCourseId,
            stripe_session_id: session.id,
            amount: amountTotal,
          });
        } catch (insertErr) {
          if (isDuplicateKeyError(insertErr)) {
            logInfo('webhook_duplicate_purchase_ignored', {
              request_id: metadataRequestId,
              event_type: event.type,
              stripe_event_id: event.id,
              session_id: session.id,
              user_id: metadataUserId,
              course_id: metadataCourseId,
            });
            return res.status(200).json({ ok: true, received: true });
          }
          throw insertErr;
        }
      }

      const { error: entitlementError } = await supabase
        .from('user_course_access')
        .upsert(
          {
            user_id: metadataUserId,
            course_id: metadataCourseId,
            granted_by: 'purchase',
          },
          {
            onConflict: 'user_id,course_id',
            ignoreDuplicates: true,
          }
        );

      if (entitlementError) {
        throw entitlementError;
      }

      logInfo('course_access_granted', {
        request_id: metadataRequestId,
        user_id: metadataUserId,
        course_id: metadataCourseId,
        stripe_session_id: session.id,
      });
    } catch (_err) {
      logError('webhook_database_error', {
        request_id: metadataRequestId,
        event_type: event.type,
        stripe_event_id: event.id,
        session_id: session.id,
        user_id: metadataUserId,
        course_id: metadataCourseId,
      });
      await persistWebhookFailure({
        stripeEventId: event.id,
        eventType: event.type,
        errorType: 'database_error',
        payload: {
          request_id: metadataRequestId,
          session_id: session.id,
          user_id: metadataUserId,
          course_id: metadataCourseId,
        },
      });
      return res.status(500).json({ ok: false, error: 'Invalid request' });
    }
  }

  return res.status(200).json({ ok: true, received: true });
}
