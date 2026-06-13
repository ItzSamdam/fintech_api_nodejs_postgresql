import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { AdminService } from "@/modules/admin-user/admin-user.service";
import { UserAdminController } from "@/modules/admin-user/admin-user.controller";
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
const controller = new UserAdminController(adminService);

class UserAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "UserAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/users").get(controller.listUsers.bind(controller));
        this.app.route("/admin/users/search").get(controller.searchUsers.bind(controller));
        this.app.route("/admin/users/:id").get(controller.getUserDetails.bind(controller));
        this.app.route("/admin/users/:id/tier/upgrade").post(controller.upgradeUserTier.bind(controller));
        this.app.route("/admin/users/:id/suspend").post(controller.suspendUser.bind(controller));
        this.app.route("/admin/users/:id/unsuspend").post(controller.unsuspendUser.bind(controller));
        this.app.route("/admin/users/:id").delete(controller.deleteUser.bind(controller));
        this.app.route("/admin/users/:id/limits").put(controller.overrideLimits.bind(controller));
        return this.app;
    }
}

export default UserAdminRoutesConfig;
