import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { TransferController } from "@/modules/transfer/transfer.controller";
import { TransferService } from "@/modules/transfer/transfer.service";
import { WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { TransactionRepository } from "@/modules/_common/repositories/transaction.repository";
import { TransferDetailRepository } from "@/modules/_common/repositories/transfer-detail.repository";
import { UserRepository } from "@/modules/_common/repositories/user.repository";
import { RedBillerClient } from "@/modules/_common/registry/redbiller.client.registry";
import { authenticateUser, validate } from "@/shared/middlewares";
import { EnquiryAccountRequestSchema } from "@/modules/_common/schemas/transfer-schema";
// import { CacheRepository } from "@/modules/_common/redis/cache.repository";

const transferService = new TransferService(
    new WalletRepository(),
    new TransactionRepository(),
    new TransferDetailRepository(),
    new UserRepository(),
    new RedBillerClient(),
    // new CacheRepository()
);
const controller = new TransferController(transferService);

class TransferRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "TransferRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/banks")
            .get(
                authenticateUser,
                // validate(),
                controller.getBanks.bind(controller)
            );

        this.app.route("/banks/verify-account")
            .post(
                authenticateUser,
                validate(EnquiryAccountRequestSchema),
                controller.nameEnquiry.bind(controller)
            );

        this.app.route("/transfer")
            .post(
                authenticateUser,
                validate(),
                controller.sendTransfer.bind(controller)
            );

        this.app.route("/transfer/wallet")
            .post(
                authenticateUser,
                validate(),
                controller.sendToWallet.bind(controller)
            );

        this.app.route("/transfer/:id/status")
            .get(
                authenticateUser,
                validate(),
                controller.getTransferStatus.bind(controller)
            );

        this.app.route("/transfer/:id/retry")
            .put(
                authenticateUser,
                validate(),
                controller.retryTransfer.bind(controller)
            );

        this.app.route("/transactions")
            .get(
                authenticateUser,
                validate(),
                controller.getTransferHistory.bind(controller)
            );

        return this.app;
    }
}

export default TransferRoutesConfig;
