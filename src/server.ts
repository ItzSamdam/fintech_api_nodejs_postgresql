import "tsconfig-paths/register";
import { app } from "@/app";
import { config, logger } from "@/shared/config";
import { sequelize, initDatabase } from "@/shared/database";
import { initializeCronJobs } from "@/cron-jobs";

async function startServer(): Promise<void> {
  try {
    await initDatabase();

    const server = app.listen(config.port, () => {
      logger.info(`🖥 Server running on port ${config.port}`);
    });

    initializeCronJobs();

    const shutdown = async (): Promise<void> => {
      logger.info("SIGTERM/SIGINT received: shutting down gracefully...");
      try {
        await sequelize.close();
        logger.info("Database connection closed");
        server.close(() => {
          logger.info("HTTP server closed");
          process.exit(0);
        });
      } catch (err: any) {
        logger.error("Error during shutdown:", err);
        process.exit(1);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err: any) {
    logger.error(`🚨 Error starting application: ${err.message}`);
    process.exit(1);
  }
}

void startServer();