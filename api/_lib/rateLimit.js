import { Redis } from '@upstash/redis';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

export const isRateLimited = async (req, { prefix, maxRequests, windowSeconds = 60 }) => {
  if (!redis) return false;

  try {
    const ip = getClientIp(req);
    const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const key = `${prefix}:${ip}:${windowBucket}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds + 5);
    }

    return count > maxRequests;
  } catch (_err) {
    // Fail open so checkout/signup flow remains available.
    return false;
  }
};
