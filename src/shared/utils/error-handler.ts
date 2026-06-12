import { logger, config } from "@/shared/config";
import { type ErrorRequestHandler } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export const ErrorHandler: ErrorRequestHandler = (
  err: AppError,
  req,
  res,
  next
) => {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message =
    statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Something went wrong';

  // Log with context
  logger.error({
    statusCode,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Build response payload
  const responsePayload = {
    success: false,
    message,
    data: null,
    ...(config.serverEnv === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(responsePayload);
};
