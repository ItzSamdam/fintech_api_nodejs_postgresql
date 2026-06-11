import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config, logger } from "@/shared/config";
import { NoTokenException, TokenException } from "@/shared/exceptions";
import { type AdminPayload } from "@/shared/types/global";
import { AdminUser } from "@/shared/database/models";

const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;

    return parts[1];
};

export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = extractToken(req);
    if (!token) {
        next(new NoTokenException());
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwt.adminSecret) as AdminPayload;

        if (decoded.type !== "admin") {
            next(new TokenException("Invalid token type"));
            return;
        }

        if (decoded.expiredAt && Date.now() >= decoded.expiredAt.getTime()) {
            next(new TokenException("Token has expired"));
            return;
        }

        const admin = await AdminUser.findByPk(decoded.id);
        if (!admin) {
            next(new TokenException("Admin not found"));
            return;
        }

        if (!admin.isActive) {
            next(new TokenException("Admin account is deactivated"));
            return;
        }

        req.admin = decoded;
        req.token = token;

        next();
    } catch (error) {
        logger.error(error);
        next(new TokenException("Invalid or expired token"));
    }
};
