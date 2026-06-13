import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { ProviderAdminController } from "@/modules/admin-user/provider.controller";
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

const controller = new ProviderAdminController(adminService);

class ProviderAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "ProviderAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/providers").get(controller.listProviders.bind(controller));
        this.app.route("/admin/providers/:id/toggle").put(controller.toggleProvider.bind(controller));
        this.app.route("/admin/providers/:id/priority").put(controller.setProviderPriority.bind(controller));
        this.app.route("/admin/providers/:id/health").get(controller.checkProviderHealth.bind(controller));
        this.app.route("/admin/providers/logs").get(controller.getProviderLogs.bind(controller));
        return this.app;
    }
}

export default ProviderAdminRoutesConfig;
