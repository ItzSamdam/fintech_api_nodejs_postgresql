import { format, transports, createLogger, type Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "@/shared/config/dev";

const enumerateErrorFormat = format((info) => {
  if (info.message instanceof Error) {
    info.message = {
      message: info.message.message,
      stack: info.message.stack,
      name: info.message.name,
    } as any;
  }

  if (info instanceof Error) {
    return Object.assign(info, {
      message: info.message,
      stack: info.stack,
      name: info.name,
    });
  }

  return info;
});

// General rotating log file (JSON structured)
const generalTransport = new DailyRotateFile({
  filename: `${config.logConfig.logFolder}/%DATE%-${config.logConfig.logFile}.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: format.combine(
    format.timestamp(),
    enumerateErrorFormat(),
    format.errors({ stack: true }),
    format.json() // structured JSON logs
  ),
});

// Separate error log file (JSON structured)
const errorTransport = new DailyRotateFile({
  filename: `${config.logConfig.logFolder}/%DATE%-error.log`,
  level: "error",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  format: format.combine(
    format.timestamp(),
    enumerateErrorFormat(),
    format.errors({ stack: true }),
    format.json()
  ),
});

export const logger: Logger = createLogger({
  level: config.logConfig.logLevel || "info",
  transports: [
    generalTransport,
    errorTransport,
    new transports.Console({
      level: "debug",
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp }) => {
          return `[${String(timestamp)}] ${String(level)}: ${String(message)}`;
        })
      ),
    }),
  ],
});
