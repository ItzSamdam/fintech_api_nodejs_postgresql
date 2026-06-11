import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config, logger } from "@/shared/config";
import { NoTokenException, TokenException } from "@/shared/exceptions";
import { type UserPayload } from "@/shared/types/global";
import { User, Session } from "@/shared/database/models";

const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;

    return parts[1];
};

export const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = extractToken(req);
    if (!token) {
        next(new NoTokenException("Missing authorization header"));
        return;
    }

    try {
        // Parse & validate token
        const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;

        if (decoded.type !== "user") {
            next(new TokenException("Invalid token type"));
            return;
        }

        if (decoded.expiredAt && Date.now() >= decoded.expiredAt.getTime()) {
            next(new TokenException("Token has expired"));
            return;
        }

        // Validate user ID format
        if (!decoded.userId) {
            next(new TokenException("Invalid user ID in token"));
            return;
        }

        // Check session
        const session = await Session.findOne({
            where: {
                userId: decoded.userId,
                token,
                isActive: true,
                expiresAt: { $gt: new Date() },
            },
        });
        if (!session) {
            next(new TokenException("Session not found or expired"));
            return;
        }

        // Check user record
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            next(new TokenException("User not found"));
            return;
        }

        if (user.isSuspended) {
            next(new TokenException(`Account is suspended: ${user.suspensionReason}`));
            return;
        }

        if (!user.isActive) {
            next(new TokenException("Account is deactivated"));
            return;
        }

        // Attach to request
        req.user = decoded;
        req.session = session;
        req.token = token;

        next();
    } catch (error) {
        logger.error(error);
        next(new TokenException("Invalid or expired token"));
    }
};
