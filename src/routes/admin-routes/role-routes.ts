import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { RoleAdminController } from "@/modules/admin-user/role.controller";
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

const controller = new RoleAdminController(adminService);

class RoleAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "RoleAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/roles").get(controller.listRoles.bind(controller));
        this.app.route("/admin/roles").post(controller.createRole.bind(controller));
        this.app.route("/admin/roles/:id").put(controller.updateRole.bind(controller));
        this.app.route("/admin/roles/:id").delete(controller.deleteRole.bind(controller));

        this.app.route("/admin/staff").get(controller.listStaff.bind(controller));
        this.app.route("/admin/staff/invite").post(controller.inviteStaff.bind(controller));
        this.app.route("/admin/staff/:id/role").put(controller.assignRole.bind(controller));
        this.app.route("/admin/staff/:id").delete(controller.removeStaff.bind(controller));
        this.app.route("/admin/staff/:id/audit").get(controller.getStaffAudit.bind(controller));
        return this.app;
    }
}

export default RoleAdminRoutesConfig;
