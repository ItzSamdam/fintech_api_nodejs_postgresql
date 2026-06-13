import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { WalletAdminController } from "@/modules/admin-user/wallet.controller";
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

const controller = new WalletAdminController(adminService);

class WalletAdminRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "WalletAdminRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/admin/wallets").get(controller.listWallets.bind(controller));
        this.app.route("/admin/wallets/:id").get(controller.getWalletDetails.bind(controller));
        // this.app.route("/admin/wallets/credit").post(controller.creditWallet.bind(controller));
        // this.app.route("/admin/wallets/debit").post(controller.debitWallet.bind(controller));
        this.app.route("/admin/wallets/freeze").post(controller.freezeWallet.bind(controller));
        this.app.route("/admin/wallets/unfreeze").post(controller.unfreezeWallet.bind(controller));
        this.app.route("/admin/wallets/balances/summary").get(controller.getBalanceSummary.bind(controller));
        return this.app;
    }
}

export default WalletAdminRoutesConfig;
