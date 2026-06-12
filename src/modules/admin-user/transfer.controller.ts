import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";

export class TransactionAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/transactions
    async listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const filters: Record<string, any> = {};
            if (req.query.category) filters.category = req.query.category;
            if (req.query.status) filters.status = req.query.status;
            if (req.query.from_date) filters.fromDate = req.query.from_date;
            if (req.query.to_date) filters.toDate = req.query.to_date;
            if (req.query.user_id) filters.userId = req.query.user_id;

            const { transactions, total } = await this.adminService.listTransactions(offset, limit, filters);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: transactions,
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

    // GET /admin/transactions/:id
    async getTransactionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const transactionId = req.params.id;
            const transaction = await this.adminService.getTransactionDetails(transactionId);
            res.json({ success: true, data: transaction });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/transactions/reverse
    // async reverseTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const { transactionId, reason, notifyUser } = req.body;
    //         await this.adminService.reverseTransaction(transactionId, reason, notifyUser);
    //         res.json({ success: true, message: "Transaction reversed successfully" });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // GET /admin/transactions/summary
    // async getTransactionSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const startDate = req.query.start_date as string;
    //         const endDate = req.query.end_date as string;
    //         const summary = await this.adminService.getTransactionSummary(startDate, endDate);
    //         res.json({ success: true, data: summary });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // POST /admin/transactions/void
    // async voidTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const { transactionId, reason } = req.body;
    //         await this.adminService.voidTransaction(transactionId, reason);
    //         res.json({ success: true, message: "Transaction voided successfully" });
    //     } catch (err) {
    //         next(err);
    //     }
    // }
}
