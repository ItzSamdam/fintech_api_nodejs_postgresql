import Redis from "ioredis";

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    poolSize?: number; // not directly used in ioredis
}

export function initRedis(cfg: RedisConfig): Redis {
    const client = new Redis({
        host: cfg.host,
        port: cfg.port,
        password: cfg.password,
        db: cfg.db ?? 0,
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
    });

    client.on("connect", () => {
        console.log("✓ Redis connection established");
        console.log(`  Host: ${cfg.host}:${cfg.port}`);
        console.log(`  DB: ${cfg.db ?? 0}`);
    });

    client.on("error", (err) => {
        console.error("Failed to connect to Redis:", err);
    });

    return client;
}

export async function closeRedis(client: Redis): Promise<void> {
    if (client) {
        await client.quit();
    }
}
