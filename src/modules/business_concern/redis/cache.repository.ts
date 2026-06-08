import type Redis from "ioredis";

export class CacheRepository {
    private readonly client: Redis;

    constructor(client: Redis) {
        this.client = client;
    }

    async set(key: string, value: any, expirationSeconds: number): Promise<void> {
        const data = JSON.stringify(value);
        await this.client.set(key, data, "EX", expirationSeconds);
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        // JSON.parse returns `any`; cast via `unknown` first to avoid assigning `any` to a typed return
        const parsed = JSON.parse(data) as unknown;
        return parsed as T;
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result > 0;
    }

    async setNX(key: string, value: any, expirationSeconds: number): Promise<boolean> {
        const data = JSON.stringify(value);
        // ioredis typings expect expiration mode before set mode: (key, value, mode, ttl, setMode)
        const result = await this.client.set(key, data, "EX", expirationSeconds, "NX");
        return result === "OK";
    }

    async increment(key: string): Promise<number> {
        return await this.client.incr(key);
    }

    async setExpiration(key: string, expirationSeconds: number): Promise<void> {
        await this.client.expire(key, expirationSeconds);
    }
}

// ========== Session Cache ==========
export class SessionCache {
    private readonly cache: CacheRepository;

    constructor(client: Redis) {
        this.cache = new CacheRepository(client);
    }

    async storeToken(userID: string, token: string, expirationSeconds: number): Promise<void> {
        const key = `session:${token}`;
        await this.cache.set(key, userID, expirationSeconds);
    }

    async getUserIDFromToken(token: string): Promise<string | null> {
        const key = `session:${token}`;
        return await this.cache.get<string>(key);
    }

    async invalidateToken(token: string): Promise<void> {
        const key = `session:${token}`;
        await this.cache.delete(key);
    }
}

// ========== Rate Limit Cache ==========
export class RateLimitCache {
    private readonly cache: CacheRepository;

    constructor(client: Redis) {
        this.cache = new CacheRepository(client);
    }

    async incrementRequest(key: string, windowSeconds: number): Promise<number> {
        const count = await this.cache.increment(key);
        if (count === 1) {
            await this.cache.setExpiration(key, windowSeconds);
        }
        return count;
    }

    async getRequestCount(key: string): Promise<number> {
        const val = await this.cache.get<number | string>(key);
        if (val === null || val === undefined) return 0;
        if (typeof val === "number") return val;
        return parseInt(val, 10) || 0;
    }
}
