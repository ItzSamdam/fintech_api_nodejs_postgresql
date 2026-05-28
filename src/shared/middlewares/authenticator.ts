import { CustomException, NoTokenException, TokenException } from "@/shared/exceptions";
import type { Request, Response, NextFunction } from "express";
import { logger, config } from "@/shared/config";
import jwt from "jsonwebtoken";
import type { UserPayload, AdminPayload } from "@/shared/types/global";
import { errorResponse } from "@/shared/utils";


const extractToken = (req: Request): string | null => {
  return req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.replace('Bearer ', '')
    : null;
};

const verifyToken = <T>(token: string, secret: string): T => {
  return jwt.verify(token, secret) as T;
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    next(new NoTokenException());
    return;
  }

  try {
    const decoded = verifyToken<UserPayload>(token, config.jwt.secret);

    // Ensure token was actually issued for a user, not an admin
    if (decoded.type !== 'user') {
      next(new TokenException());
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error(error);
    if (error instanceof CustomException) {
      next(error);
      return;
    }
    next(new TokenException());
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    next(new NoTokenException());
    return;
  }

  try {
    const decoded = verifyToken<AdminPayload>(token, config.jwt.adminSecret);

    // Ensure token was actually issued for an admin, not a user
    if (decoded.type !== 'admin') {
      next(new TokenException());
      return;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    logger.error(error);
    if (error instanceof CustomException) {
      next(error);
      return;
    }
    next(new TokenException());
  }
};


export const authorizeUserRole = (...roles: Array<UserPayload['role']>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(errorResponse('Forbidden: Insufficient permissions', 403, null));
      return;
    }
    next();
  };
};

export const authorizeAdminRole = (...roles: Array<AdminPayload['role']>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      next(errorResponse('Forbidden: Insufficient permissions', 403, null));
      return;
    }
    next();
  };
};