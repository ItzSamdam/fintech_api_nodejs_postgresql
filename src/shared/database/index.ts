import { Sequelize } from "sequelize-typescript";
import { config } from "@/shared/config/dev";
import { logger } from "@/shared/config/logger";

import * as models from "./models";

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "postgres",
  database: config.database.database,
  username: config.database.user,
  password: config.database.pass,
  host: config.database.host,
  port: 5432,
  pool: {
    max: 50, // tune based on workload
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  logging: config.serverEnv === "development"
    ? (msg: any) => logger.debug(msg)
    : false,
  timezone: "+00:00", // ✅ Store everything in UTC
  dialectOptions: {
    useUTC: true, // ✅ Ensure Postgres stores in UTC
    ssl: config.serverEnv === "production"
      ? {
        require: true,
        rejectUnauthorized: false
      }
      : undefined,
  },
  models: Object.values(models), // to automatically load models from the models directory
});

// Bootstrap function
export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connection established successfully.");

    // In production, rely on migrations instead of sync
    if (config.serverEnv !== "production") {
      await sequelize.sync({ force: true });
      logger.info("✅ Database synced (dev mode).");
    }
  } catch (err) {
    logger.error("❌ Unable to connect to the database:", err);
    process.exit(1); // fail fast if DB is unreachable
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await sequelize.close();
  logger.info("🔒 Database connection closed due to app termination.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await sequelize.close();
  logger.info("🔒 Database connection closed due to app shutdown.");
  process.exit(0);
});

export { sequelize };
