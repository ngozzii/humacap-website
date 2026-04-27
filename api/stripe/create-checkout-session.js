import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '../_lib/rateLimit.js';
import { sanitizeJsonBody, sanitizeStringField, sanitizeUuidField } from '../_lib/validation.js';
import { getRequestId, logInfo, logError } from '../_lib/logger.js';

const parseJsonBody = (req) => {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_err) {
      return null;
    }
  }
  return null;
};

const isJsonRequest = (req) => (req.headers['content-type'] || '').includes('application/json');

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token || token.length > 4096) return null;
  return token;
};

const resolveCourseFromDb = (courseRow) => {
  const title = typeof courseRow?.title === 'string' && courseRow.title.trim().length > 0
    ? courseRow.title.trim()
    : (typeof courseRow?.name === 'string' && courseRow.name.trim().length > 0 ? courseRow.name.trim() : null);

  const rawAmount =
    courseRow?.price_in_cents ??
    courseRow?.price_cents ??
    courseRow?.amount_in_cents ??
    (typeof courseRow?.price === 'number' ? Math.round(courseRow.price * 100) : null);

  const amountInCents = Number.isInteger(rawAmount) ? rawAmount : null;
  const currency = typeof courseRow?.currency === 'string' && courseRow.currency.trim().length > 0
    ? courseRow.currency.trim().toLowerCase()
    : 'cad';

  if (!title || !amountInCents || amountInCents <= 0) {
    return null;
  }

  return { title, amountInCents, currency };
};

export default async function handler(req, res) {
  const requestId = getRequestId(req);

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!isJsonRequest(req)) {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  if (await isRateLimited(req, { prefix: 'rl:checkout', maxRequests: 12, windowSeconds: 60 })) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const baseUrl = process.env.BASE_URL;
  if (!stripeKey || !publishableKey || !supabaseUrl || !supabaseAnonKey || !baseUrl) {
    return res.status(500).json({ ok: false, error: 'Invalid request' });
  }

  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  const userIdField = sanitizeUuidField(authData?.user?.id ?? '', { fieldName: 'user_id' });
  if (authError || !authData?.user?.id) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  if (!userIdField.ok) {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const body = parseJsonBody(req);
  const sanitizedBody = sanitizeJsonBody(body);
  if (!sanitizedBody) {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const courseIdField = sanitizeStringField(sanitizedBody.courseId, { fieldName: 'courseId', maxLength: 64 });
  if (!courseIdField.ok) {
    return res.status(400).json({ ok: false, error: 'Invalid request' });
  }

  const courseId = courseIdField.value;
  const userId = userIdField.value;
  if (!courseId) {
    return res.status(400).json({ ok: false, error: 'Invalid courseId. Please select a valid course.' });
  }

  logInfo('checkout_attempt', {
    request_id: requestId,
    endpoint: '/api/stripe/create-checkout-session',
    user_id: userId,
    course_id: courseId,
  });

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

  try {
    const { data: courseRow, error: courseLookupError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (courseLookupError || !courseRow) {
      return res.status(400).json({ ok: false, error: 'Invalid courseId. Please select a valid course.' });
    }

    const courseConfig = resolveCourseFromDb(courseRow);
    if (!courseConfig) {
      return res.status(400).json({ ok: false, error: 'Invalid course configuration.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: courseConfig.currency,
          unit_amount: courseConfig.amountInCents,
          product_data: {
            name: courseConfig.title,
            metadata: { course_id: courseId },
          },
        },
      }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        user_id: userId || '',
        course_id: courseId,
        request_id: requestId,
      },
    });

    logInfo('checkout_created', {
      request_id: requestId,
      session_id: session.id,
      user_id: userId,
      course_id: courseId,
    });

    return res.status(200).json({
      ok: true,
      sessionId: session.id,
      publishableKey,
    });
  } catch (error) {
    logError('checkout_session_create_failed', {
      request_id: requestId,
      endpoint: '/api/stripe/create-checkout-session',
      user_id: userId,
      course_id: courseId,
      reason: 'stripe_checkout_create_failed',
    });
    return res.status(500).json({
      ok: false,
      error: 'Invalid request',
    });
  }
}
