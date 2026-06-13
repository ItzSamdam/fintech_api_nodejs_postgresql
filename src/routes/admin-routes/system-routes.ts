import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { SystemAdminController } from "@/modules/admin-user/system.controller";
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

const controller = new SystemAdminController(adminService);

class SystemAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "SystemAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/settings").get(controller.getSystemSettings.bind(controller));
        this.app.route("/admin/settings").put(controller.updateSystemSettings.bind(controller));
        this.app.route("/admin/health").get(controller.healthCheck.bind(controller));
        this.app.route("/admin/audit-logs").get(controller.listAuditLogs.bind(controller));
        this.app.route("/admin/audit-logs/:id").get(controller.getAuditLog.bind(controller));
        this.app.route("/admin/backup/database").post(controller.triggerDatabaseBackup.bind(controller));
        this.app.route("/admin/metrics").get(controller.getSystemMetrics.bind(controller));
        return this.app;
    }
}

export default SystemAdminRoutesConfig;
