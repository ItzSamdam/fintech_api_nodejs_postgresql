import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";

export class ProviderAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/providers
    async listProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.adminService.listProviders(offset, limit, {});
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // PUT /admin/providers/:id/toggle
    async toggleProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.id;
            const { isActive } = req.body;

            await this.adminService.toggleProvider(providerId, isActive as boolean);

            const status = isActive ? "enabled" : "disabled";
            res.json({ success: true, message: `Provider ${status} successfully` });
        } catch (err) {
            next(err);
        }
    }

    // PUT /admin/providers/:id/priority
    async setProviderPriority(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.id;
            const { priority } = req.body;

            await this.adminService.setProviderPriority(providerId, priority as number);

            res.json({ success: true, message: "Provider priority updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/providers/:id/health
    async checkProviderHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.id;
            const status = await this.adminService.checkProviderHealth(providerId);
            res.json({ success: true, data: { status } });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/providers/logs
    async getProviderLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.query.provider_id as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const { logs, total } = await this.adminService.getProviderLogs(providerId, page, limit);

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
}
