import { type Request, type Response, type NextFunction } from "express";
import { type TransferService } from "@/modules/transfer/transfer.service";
import { getUserIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";
import { validate as validateUuid } from "uuid";

export class TransferController {
    constructor(
        private readonly transferService: TransferService
    ) { }

    async sendTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.transferService.sendTransfer(userId, req.body);
            res.json({ success: true, message: "Transfer initiated successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getTransferStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const reference = req.params.reference;
            if (!reference) {
                res.status(400).json({ error: "Validation Error", message: "Reference is required" });
                return;
            }
            const resp = await this.transferService.getTransferByReference(userId, reference);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async retryTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const { reference } = req.body;
            const resp = await this.transferService.retryTransfer(userId, reference as string);
            res.json({ success: true, message: "Transfer retry initiated", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async nameEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { bankCode, accountNumber } = req.body;
            if (!bankCode || !accountNumber) {
                res.status(400).json({ error: "Validation Error", message: "Bank code and account number are required" });
                return;
            }
            const resp = await this.transferService.nameEnquiry({bankCode, accountNumber});
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getBanks(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.transferService.getBanks();
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getTransferHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.transferService.getTransferHistory(userId, offset, limit);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async sendToWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const { recipientWalletId, amount, narration } = req.body;

            if (!recipientWalletId || !amount) {
                res.status(400).json({ error: "Validation Error", message: "Recipient wallet ID and amount are required" });
                return;
            }

            if (!validateUuid(recipientWalletId)) {
                res.status(400).json({ error: "Validation Error", message: "Invalid recipient wallet ID" });
                return;
            }

            const recipientId = recipientWalletId;
            const resp = await this.transferService.sendTransfer(userId, {recipientId, amount, narration});
            res.json({ success: true, message: "Transfer completed successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }
}
