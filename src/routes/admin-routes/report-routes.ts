import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { ReportAdminController } from "@/modules/admin-user/report.controller";
import { AdminService } from "@/modules/admin-user/admin-user.service";
import { UserRepository } from "@/modules/_common/repositories/user.repository";
import { WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { TransactionRepository } from "@/modules/_common/repositories/transaction.repository";
import { KYCRepository } from "@/modules/_common/repositories/kyc.repository";
import { ProviderRepository } from "@/modules/_common/repositories/provider.repository";
import { AuditLogRepository } from "@/modules/_common/repositories/audit-log.repository";
import { AdminUserRepository } from "@/modules/_common/repositories/admin-user.repository";
import { RoleRepository } from "@/modules/_common/repositories/role.repository";

const adminService = new AdminService(
    new UserRepository(),
    new WalletRepository(),
    new TransactionRepository(),
    new KYCRepository(),
    new ProviderRepository(),
    new AuditLogRepository(),
    new AdminUserRepository(),
    new RoleRepository()
);

const controller = new ReportAdminController(adminService);

class ReportAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "ReportAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/reports/daily").get(controller.getDailyReport.bind(controller));
        this.app.route("/admin/reports/monthly").get(controller.getMonthlyReport.bind(controller));
        this.app.route("/admin/reports/revenue/by-bill-type").get(controller.getRevenueByBillType.bind(controller));
        this.app.route("/admin/reports/top-users").get(controller.getTopUsers.bind(controller));
        this.app.route("/admin/reports/fraud-attempts").get(controller.getFraudStats.bind(controller));
        // this.app.route("/admin/reports/provider-performance").get(controller.getProviderPerformance.bind(controller));
        this.app.route("/admin/reports/export").post(controller.exportReport.bind(controller));
        return this.app;
    }
}

export default ReportAdminRoutesConfig;
