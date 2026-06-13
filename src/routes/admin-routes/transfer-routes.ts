import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { TransactionAdminController } from "@/modules/admin-user/transfer.controller";
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

const controller = new TransactionAdminController(adminService);

class TransactionAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "TransactionAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/transactions").get(controller.listTransactions.bind(controller));
        this.app.route("/admin/transactions/:id").get(controller.getTransactionDetails.bind(controller));
        // this.app.route("/admin/transactions/reverse").post(controller.reverseTransaction.bind(controller));
        // this.app.route("/admin/transactions/summary").get(controller.getTransactionSummary.bind(controller));
        // this.app.route("/admin/transactions/void").post(controller.voidTransaction.bind(controller));
        return this.app;
    }
}

export default TransactionAdminRoutesConfig;
