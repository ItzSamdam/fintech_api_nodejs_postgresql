import { type Request, type Response, type NextFunction } from "express";
import Redis from "ioredis";

const redis = new Redis();

export const rateLimiter = (requests: number, duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "127.0.0.1";
    const identifier = req.user ? `${ip}:${req.user.userId}` : ip;
    const key = `rate_limit:${identifier}`;

    const count = await redis.get(key).then(val => (val ? parseInt(val, 10) : 0));

    if (count >= requests) {
      const ttl = await redis.ttl(key);
      res.setHeader("Retry-After", ttl);
      return res.status(429).json({
        error: "Rate limit exceeded",
        retry_after: ttl,
        limit: requests,
        window: `${duration}s`,
      });
    }

    const pipeline = redis.multi();
    pipeline.incr(key);
    pipeline.expire(key, duration);
    await pipeline.exec();

    res.setHeader("X-RateLimit-Limit", requests.toString());
    res.setHeader("X-RateLimit-Remaining", (requests - count - 1).toString());
    res.setHeader("X-RateLimit-Reset", (Math.floor(Date.now() / 1000) + duration).toString());

    next();
  };
};

const requests: Record<string, number[]> = {};

export const inMemoryRateLimiter = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "127.0.0.1";
    const identifier = req.user ? `${ip}:${req.user.userId}` : ip;
    const now = Date.now();

    requests[identifier] = (requests[identifier] || []).filter(
      ts => now - ts < windowMs
    );

    if (requests[identifier].length >= maxRequests) {
      const retryAfter = windowMs - (now - requests[identifier][0]);
      res.setHeader("Retry-After", Math.ceil(retryAfter / 1000));
      return res.status(429).json({
        error: "Rate limit exceeded",
        retry_after: Math.ceil(retryAfter / 1000),
        limit: maxRequests,
        window: `${windowMs / 1000}s`,
      });
    }

    requests[identifier].push(now);

    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", (maxRequests - requests[identifier].length).toString());
    res.setHeader("X-RateLimit-Reset", (Math.floor(now / 1000) + windowMs / 1000).toString());

    next();
  };
};