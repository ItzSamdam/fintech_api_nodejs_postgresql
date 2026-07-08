import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { WalletController } from "@/modules/wallet/wallet.controller";
import { WalletService } from "@/modules/wallet/wallet.service";
import { UserRepository } from "@/modules/_common/repositories/user.repository";
import { WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { TransactionRepository } from "@/modules/_common/repositories/transaction.repository";
import { authenticateUser, validate } from "@/shared/middlewares";
import { CreateWalletRequestSchema, GetStatementRequestSchema, GetTransactionsRequestSchema, WalletActionRequestSchema } from "@/modules/_common/schemas/wallet-schema";

const walletService = new WalletService(
    new WalletRepository(),
    new TransactionRepository(),
    new UserRepository(),
);
const controller = new WalletController(walletService);

class WalletRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "WalletRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/wallet")
            .post(
                authenticateUser,
                validate(CreateWalletRequestSchema),
                controller.createWallet.bind(controller)
            );

        this.app.route("/wallet")
            .get(
                authenticateUser,
                controller.getWallet.bind(controller)
            );

        this.app.route("/wallet/balance")
            .get(
                authenticateUser,
                controller.getBalance.bind(controller)
            );

        this.app.route("/wallet/transactions")
            .get(
                authenticateUser,
                validate(GetTransactionsRequestSchema),
                controller.getTransactions.bind(controller)
            );

        this.app.route("/wallet/transactions/:id")
            .get(
                authenticateUser,
                controller.getTransactionById.bind(controller)
            );

        this.app.route("/wallet/limits")
            .get(
                authenticateUser,
                controller.getLimits.bind(controller)
            );

        this.app.route("/wallet/lock")
            .post(
                authenticateUser,
                validate(WalletActionRequestSchema),
                controller.lockWallet.bind(controller)
            );

        this.app.route("/wallet/unlock")
            .post(
                authenticateUser,
                controller.unlockWallet.bind(controller)
            );

        this.app.route("/wallet/statement")
            .get(
                authenticateUser,
                validate(GetStatementRequestSchema),
                controller.getStatement.bind(controller)
            );

        return this.app;
    }
}

export default WalletRoutesConfig;
