import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";

export class SystemAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/settings
    async getSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = await this.adminService.getSystemSettings();
            res.json({ success: true, data: settings });
        } catch (err) {
            next(err);
        }
    }

    // PUT /admin/settings
    async updateSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.adminService.updateSystemSettings(req.body);
            res.json({ success: true, message: "System settings updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/health
    async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const health = await this.adminService.healthCheck();
            let healthStatus = "healthy";
            if (health.status === "unhealthy") healthStatus = "unhealthy";

            const httpStatus = healthStatus === "healthy" ? 200 : 503;
            res.status(httpStatus).json({ success: healthStatus === "healthy", data: health });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/audit-logs
    async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const filters: Record<string, any> = {};
            if (req.query.admin_id) filters.adminId = req.query.admin_id;
            if (req.query.action) filters.action = req.query.action;
            if (req.query.from_date) filters.fromDate = req.query.from_date;
            if (req.query.to_date) filters.toDate = req.query.to_date;

            const { logs, total } = await this.adminService.getAuditLogs(offset, limit, filters);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: logs,
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

    // GET /admin/audit-logs/:id
    async getAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const logId = req.params.id;
            const log = await this.adminService.getAuditLog(logId);
            res.json({ success: true, data: log });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/backup/database
    async triggerDatabaseBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const backup = await this.adminService.triggerDatabaseBackup();
            res.json({ success: true, message: "Database backup triggered successfully", data: backup });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/metrics
    async getSystemMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const metrics = await this.adminService.getSystemMetrics();
            res.json({ success: true, data: metrics });
        } catch (err) {
            next(err);
        }
    }
}
