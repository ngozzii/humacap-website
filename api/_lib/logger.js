import { randomUUID } from 'node:crypto';

export const getRequestId = (req) => {
  const incoming = req?.headers?.['x-request-id'];
  if (typeof incoming === 'string' && incoming.trim().length > 0 && incoming.trim().length <= 128) {
    return incoming.trim();
  }
  return randomUUID();
};

const buildLogEntry = (level, event, payload = {}) => ({
  level,
  event,
  timestamp: new Date().toISOString(),
  ...payload,
});

export const logInfo = (event, payload = {}) => {
  console.log(JSON.stringify(buildLogEntry('info', event, payload)));
};

export const logError = (event, payload = {}) => {
  console.error(JSON.stringify(buildLogEntry('error', event, payload)));
};
