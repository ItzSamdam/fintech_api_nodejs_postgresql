import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";
// import { getAdminIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";


export class WalletAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/wallets
    async listWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const filters: Record<string, any> = {};
            if (req.query.is_locked) filters.isLocked = req.query.is_locked === "true";
            if (req.query.currency) filters.currency = req.query.currency;

            const { wallets, total } = await this.adminService.listWallets(offset, limit, filters);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: wallets,
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

    // GET /admin/wallets/:id
    async getWalletDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const walletId = req.params.id;
            const wallet = await this.adminService.getWalletDetails(walletId);
            res.json({ success: true, data: wallet });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/wallets/credit
    // async creditWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const adminId = getAdminIdFromRequest(req);
    //         const resp = await this.adminService.manualCredit(req.body, adminId);
    //         res.json({ success: true, message: "Wallet credited successfully", data: resp });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // // POST /admin/wallets/debit
    // async debitWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const adminId = getAdminIdFromRequest(req);
    //         const resp = await this.adminService.manualDebit(req.body, adminId);
    //         res.json({ success: true, message: "Wallet debited successfully", data: resp });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // POST /admin/wallets/freeze
    async freezeWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, reason } = req.body;
            await this.adminService.freezeWallet(userId as string, reason as string);
            res.json({ success: true, message: "Wallet frozen successfully" });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/wallets/unfreeze
    async unfreezeWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body;
            await this.adminService.unfreezeWallet(userId as string);
            res.json({ success: true, message: "Wallet unfrozen successfully" });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/wallets/balances/summary
    async getBalanceSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const summary = await this.adminService.getBalanceSummary();
            res.json({ success: true, data: summary });
        } catch (err) {
            next(err);
        }
    }
}
