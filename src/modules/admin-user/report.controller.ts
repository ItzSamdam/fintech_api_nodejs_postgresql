import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";

export class ReportAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/reports/daily
    async getDailyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dateStr = req.query.date as string;
            let date: Date;
            if (!dateStr) {
                date = new Date();
            } else {
                const parsed = new Date(dateStr);
                if (isNaN(parsed.getTime())) {
                    res.status(400).json({ error: "Validation Error", message: "Invalid date format. Use YYYY-MM-DD" });
                    return;
                }
                date = parsed;
            }
            const report = await this.adminService.getDailyReport(date);
            res.json({ success: true, data: report });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/reports/monthly
    async getMonthlyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const year = parseInt(req.query.year as string) || new Date().getFullYear();
            const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
            const report = await this.adminService.getMonthlyReport(year, month);
            res.json({ success: true, data: report });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/reports/revenue/by-bill-type
    async getRevenueByBillType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = req.query.start_date as string;
            const endDate = req.query.end_date as string;
            const revenue = await this.adminService.getRevenueByBillType(startDate, endDate);
            res.json({ success: true, data: revenue });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/reports/top-users
    async getTopUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const users = await this.adminService.getTopUsers(limit);
            res.json({ success: true, data: users });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/reports/fraud-attempts
    async getFraudStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this.adminService.getFraudStats();
            res.json({ success: true, data: stats });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/reports/provider-performance
    // async getProviderPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const startDate = req.query.start_date as string;
    //         const endDate = req.query.end_date as string;
    //         const performance = await this.adminService.getProviderPerformance(startDate, endDate);
    //         res.json({ success: true, data: performance });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // POST /admin/reports/export
    async exportReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportType, format, startDate, endDate } = req.body;
            const { data, format: fileFormat } = await this.adminService.exportReport(reportType as string, format as string, startDate as string, endDate as string);

            let contentType = "text/csv";
            if (fileFormat === "excel") {
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }

            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `attachment; filename=report.${fileFormat}`);
            res.send(data);
        } catch (err) {
            next(err);
        }
    }
}
