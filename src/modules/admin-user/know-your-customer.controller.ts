import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";
import { getAdminIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";
import { validate as validateUuid } from "uuid";

export class KYCAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/kyc/pending
    async listPendingKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const { kycs, total } = await this.adminService.getPendingKYC(offset, limit);

            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: kycs,
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

    // GET /admin/kyc/:id
    async getKYCDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const kycId = req.params.id;
            if (!validateUuid(kycId)) {
                res.status(400).json({ error: "Validation Error", message: "Invalid KYC ID" });
                return;
            }

            const kyc = await this.adminService.getKYCDetails(kycId);
            res.json({ success: true, data: kyc });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/kyc/:id/approve
    async approveKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = getAdminIdFromRequest(req);
            const kycId = req.params.id;
            if (!validateUuid(kycId)) {
                res.status(400).json({ error: "Validation Error", message: "Invalid KYC ID" });
                return;
            }

            const { notes } = req.body;
            await this.adminService.approveKYC(kycId, notes as string, adminId);

            res.json({ success: true, message: "KYC approved successfully" });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/kyc/:id/reject
    async rejectKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = getAdminIdFromRequest(req);
            const kycId = req.params.id;
            if (!validateUuid(kycId)) {
                res.status(400).json({ error: "Validation Error", message: "Invalid KYC ID" });
                return;
            }

            const { reason } = req.body;
            await this.adminService.rejectKYC(kycId, reason as string, adminId);

            res.json({ success: true, message: "KYC rejected successfully" });
        } catch (err) {
            next(err);
        }
    }
}
