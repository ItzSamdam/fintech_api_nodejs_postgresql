import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";
import { getAdminIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";

export class UserAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/users
    async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const filters: Record<string, any> = {};
            if (req.query.tier) filters.tier = req.query.tier;
            if (req.query.status) {
                if (req.query.status === "active") filters.isActive = true;
                if (req.query.status === "suspended") filters.isSuspended = true;
            }
            if (req.query.from_date) filters.fromDate = req.query.from_date;
            if (req.query.to_date) filters.toDate = req.query.to_date;

            const resp = await this.adminService.listUsers(offset, limit, filters);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/users/:id
    async getUserDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            // if (!validateUuid(userId)) {
            //     res.status(400).json({ error: "Validation Error", message: "Invalid user ID" });
            //     return;
            // }
            const resp = await this.adminService.getUserDetails(userId);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/users/:id/tier/upgrade
    async upgradeUserTier(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = getAdminIdFromRequest(req);
            const userId = req.params.id;
            // if (!validateUuid(userId)) {
            //     res.status(400).json({ error: "Validation Error", message: "Invalid user ID" });
            //     return;
            // }
            const { tier } = req.body;
            await this.adminService.upgradeUserTier(userId, tier as number, adminId);
            res.json({ success: true, message: "User tier upgraded successfully" });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/users/:id/suspend
    async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            // if (!validateUuid(userId)) {
            //     res.status(400).json({ error: "Validation Error", message: "Invalid user ID" });
            //     return;
            // }
            const { reason, duration } = req.body;
            await this.adminService.suspendUser(userId, reason as string, duration as string);
            res.json({ success: true, message: "User suspended successfully" });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/users/:id/unsuspend
    async unsuspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            // if (!validateUuid(userId)) {
            //     res.status(400).json({ error: "Validation Error", message: "Invalid user ID" });
            //     return;
            // }
            await this.adminService.unsuspendUser(userId);
            res.json({ success: true, message: "User unsuspended successfully" });
        } catch (err) {
            next(err);
        }
    }

    // DELETE /admin/users/:id
    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            // if (!validateUuid(userId)) {
            //     res.status(400).json({ error: "Validation Error", message: "Invalid user ID" });
            //     return;
            // }
            await this.adminService.deleteUser(userId);
            res.json({ success: true, message: "User deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    // PUT /admin/users/:id/limits
    async overrideLimits(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            // if (!validateUuid(userId)) {
            //     res.status(400).json({ error: "Validation Error", message: "Invalid user ID" });
            //     return;
            // }
            await this.adminService.overrideLimits(userId, req.body);
            res.json({ success: true, message: "User limits overridden successfully" });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/users/search
    async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query.q as string;
            if (!query) {
                res.status(400).json({ error: "Validation Error", message: "Search query is required" });
                return;
            }
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const { users, total } = await this.adminService.searchUsers(query, offset, limit);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: users,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });
        } catch (err) {
            next(err);
        }
    }
}
