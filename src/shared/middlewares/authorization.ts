import { type Request, type Response, type NextFunction } from "express";
import { Role } from "@/shared/database/models";
import { ForbiddenException, ServerException, TokenException } from "../exceptions";

export const requireAdminRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new TokenException("Admin authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      next(
        new ForbiddenException("Forbidden: Insufficient permissions")
      );
      return;
    }

    next();
  };
};

export const requireAdminPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      next(new TokenException("Admin authentication required"));
      return;
    }

    if (req.admin.role === "super_admin") {
      next();
      return;
    }

    const role = await Role.findOne({ where: { name: req.admin.role } });
    if (!role) {
      next(new ServerException("Failed to fetch role permissions"));
      return;
    }

    if (!Array.isArray(role.permissions)) {
      next(new ServerException("Invalid permissions format"));
      return;
    }
    const permissions = role.permissions as string[];

    if (!permissions.includes(permission) && !permissions.includes("*")) {
      next(
        new ForbiddenException("Forbidden: Insufficient permissions")
      );
      return;
    }

    next();
  };
};
