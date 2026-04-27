const SQLI_PATTERN =
  /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\balter\b|\btruncate\b|--|;|\bOR\b\s+['"]?1['"]?\s*=\s*['"]?1)/i;
const SCRIPT_PATTERN = /<\s*\/?\s*script\b/i;
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const hasUnsafeContent = (value) => SCRIPT_PATTERN.test(value) || SQLI_PATTERN.test(value);

export const sanitizeStringField = (value, { maxLength, fieldName, allowEmpty = false }) => {
  if (typeof value !== 'string') {
    return { ok: false, error: `${fieldName} must be a string.` };
  }

  const sanitized = value.trim();
  if (!allowEmpty && sanitized.length === 0) {
    return { ok: false, error: `${fieldName} is required.` };
  }
  if (maxLength && sanitized.length > maxLength) {
    return { ok: false, error: `${fieldName} is too long.` };
  }
  if (hasUnsafeContent(sanitized)) {
    return { ok: false, error: `${fieldName} contains disallowed content.` };
  }

  return { ok: true, value: sanitized };
};

export const validateEmail = (value) => EMAIL_PATTERN.test(value);

export const validateUuid = (value) => UUID_PATTERN.test(value);

export const sanitizeUuidField = (value, { fieldName }) => {
  const sanitized = sanitizeStringField(value, {
    fieldName,
    maxLength: 36,
  });
  if (!sanitized.ok) return sanitized;
  if (!validateUuid(sanitized.value)) {
    return { ok: false, error: `${fieldName} must be a valid UUID.` };
  }
  return { ok: true, value: sanitized.value };
};

export const sanitizeJsonBody = (body) =>
  body && typeof body === 'object' && !Array.isArray(body) ? body : null;
