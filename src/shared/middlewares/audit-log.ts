import { type Request, type Response, type NextFunction } from "express";
import { AuditLog } from "@/shared/database/models";

/** Utility: safely stringify JSON */
const toJSON = (v: any): string => {
    try {
        return v ? JSON.stringify(v) : "";
    } catch {
        return "";
    }
};

export const logAdminAction = (entityType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const adminUser = req.admin;
        if (!adminUser) {
            next(); return;
        }

        let newValue: any = null;
        if (req.method !== "GET" && req.body) {
            newValue = req.body;
        }

        next();

        setImmediate(async () => {
            const auditLog = {
                admin_id: adminUser.id,
                action: `${req.method} ${req.path}`,
                entity_type: entityType,
                entity_id: req.params.id,
                old_value: "",
                new_value: toJSON(newValue),
                ip_address: req.ip,
                user_agent: req.headers["user-agent"],
                created_at: new Date(),
            };

            await AuditLog.create(auditLog);
        });
    };
};

/** Log important user actions (login, password change, etc.) */
export const logUserAction = (action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) {
            next(); return;
        }

        next();

        setImmediate(async () => {
            const auditLog = {
                user_id: user.userId,
                action,
                entity_type: "user",
                ip_address: req.ip,
                user_agent: req.headers["user-agent"],
                metadata: toJSON({ path: req.path }),
                created_at: new Date(),
            };

            await AuditLog.create(auditLog);
        });
    };
};
