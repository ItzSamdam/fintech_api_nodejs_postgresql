import { type Request } from "express";
import { type UserPayload, type AdminPayload } from "@/shared/types/global";
import { TokenException } from "@/shared/exceptions";

/** Retrieve authenticated user payload from request */
export const getUserFromRequest = (req: Request): UserPayload => {
    if (!req.user) {
        throw new TokenException("User not found in request context");
    }
    return req.user;
};

/** Retrieve authenticated user ID from request */
export const getUserIdFromRequest = (req: Request): string => {
    if (!req.user?.userId) {
        throw new TokenException("User ID not found in request context");
    }
    return req.user.userId;
};

/** Retrieve authenticated admin payload from request */
export const getAdminFromRequest = (req: Request): AdminPayload => {
    if (!req.admin) {
        throw new TokenException("Admin not found in request context");
    }
    return req.admin;
};

/** Retrieve authenticated admin ID from request */
export const getAdminIdFromRequest = (req: Request): string => {
    if (!req.admin?.id) {
        throw new TokenException("Admin ID not found in request context");
    }
    return req.admin.id;
};
