import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '../_lib/rateLimit.js';
import { sanitizeJsonBody, sanitizeStringField, validateEmail } from '../_lib/validation.js';
import { getRequestId, logError, logInfo } from '../_lib/logger.js';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.com',
  'trashmail.com',
  'yopmail.com',
]);

const PASSWORD_RULES = [
  { key: 'length', message: 'Password must be at least 8 characters long.', test: (value) => value.length >= 8 },
  { key: 'uppercase', message: 'Password must include at least one uppercase letter.', test: (value) => /[A-Z]/.test(value) },
  { key: 'lowercase', message: 'Password must include at least one lowercase letter.', test: (value) => /[a-z]/.test(value) },
  { key: 'number', message: 'Password must include at least one number.', test: (value) => /\d/.test(value) },
  { key: 'special', message: 'Password must include at least one special character.', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

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

const validatePassword = (password) => {
  const failures = PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.message);
  return {
    valid: failures.length === 0,
    failures,
  };
};

const isEmailStrictlyValid = (email) => {
  if (!validateEmail(email) || email.length > 254) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return false;
  if (localPart.length > 64 || domainPart.length > 253) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..') || domainPart.includes('..')) return false;
  if (!domainPart.includes('.')) return false;

  return true;
};

const isDisposableDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && DISPOSABLE_EMAIL_DOMAINS.has(domain);
};

const isCaptchaRequired = () => process.env.CAPTCHA_ENFORCED === 'true';

const hasCaptchaToken = (req, body) => {
  const headerToken = req.headers['x-captcha-token'];
  if (typeof headerToken === 'string' && headerToken.trim().length > 0) return true;
  if (typeof body?.captchaToken === 'string' && body.captchaToken.trim().length > 0) return true;
  return false;
};

export default async function handler(req, res) {
  const requestId = getRequestId(req);
  console.log('SIGNUP START');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isJsonRequest(req)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (await isRateLimited(req, { prefix: 'rl:signup', maxRequests: 8, windowSeconds: 60 })) {
    logError('signup_rate_limited', {
      request_id: requestId,
      endpoint: '/api/auth/signup',
    });
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const body = parseJsonBody(req);
  const sanitizedBody = sanitizeJsonBody(body);
  if (!sanitizedBody) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const emailField = sanitizeStringField(sanitizedBody.email, { fieldName: 'Email', maxLength: 254 });
  const passwordField = sanitizeStringField(sanitizedBody.password, { fieldName: 'Password', maxLength: 128 });
  if (!emailField.ok || !passwordField.ok) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const email = emailField.value.toLowerCase();
  const password = passwordField.value;
  if (!isEmailStrictlyValid(email) || isDisposableDomain(email)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (isCaptchaRequired() && !hasCaptchaToken(req, sanitizedBody)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    logInfo('signup_request_received', {
      request_id: requestId,
      endpoint: '/api/auth/signup',
      has_email: !!email,
    });
    console.log('SIGNUP VALIDATION PASSED');

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: req.headers.origin || undefined,
      },
    });
    console.log('SUPABASE RESPONSE', { success: !!data, error });

    if (error) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('SIGNUP ERROR', error);
    logError('signup_failed', {
      request_id: requestId,
      endpoint: '/api/auth/signup',
      error_message: error?.message || 'unknown_error',
      error_name: error?.name || 'Error',
      error_stack: error?.stack || null,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
