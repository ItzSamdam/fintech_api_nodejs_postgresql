import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { KYCAdminController } from "@/modules/admin-user/know-your-customer.controller";
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

const controller = new KYCAdminController(adminService);

class KYCAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "KYCAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/kyc/pending").get(controller.listPendingKYC.bind(controller));
        this.app.route("/admin/kyc/:id").get(controller.getKYCDetails.bind(controller));
        this.app.route("/admin/kyc/:id/approve").post(controller.approveKYC.bind(controller));
        this.app.route("/admin/kyc/:id/reject").post(controller.rejectKYC.bind(controller));
        return this.app;
    }
}

export default KYCAdminRoutesConfig;
