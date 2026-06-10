import { type WalletRepository } from "@/modules/_business/repositories/wallet.repository";
import { type TransactionRepository } from "@/modules/_business/repositories/transaction.repository";
import { type TransferDetailRepository } from "@/modules/_business/repositories/transfer-detail.repository";
import { type UserRepository } from "@/modules/_business/repositories/user.repository";
import { type RedBillerClient } from "@/modules/_business/registry/redbiller.client.registry";
import { type CacheRepository } from "@/modules/_business/redis/cache.repository";
import { type TransactionResponse, type TransactionHistoryResponse } from "@/modules/_business/interfaces/response/wallet";

export class TransferService {
    constructor(
        private readonly walletRepo: WalletRepository,
        private readonly transactionRepo: TransactionRepository,
        private readonly transferDetailRepo: TransferDetailRepository,
        private readonly userRepo: UserRepository,
        private readonly redBiller: RedBillerClient,
        private readonly cache: CacheRepository
    ) { }

    /** Send transfer (wallet or bank) */
    async sendTransfer(userId: string, req: any): Promise<TransactionResponse> {
        const wallet = await this.walletRepo.getByUserIdForUpdate(userId);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.isLocked) throw new Error("Wallet is locked");

        let recipientName = "";
        let recipientWallet: any;

        if (req.recipientType === "bank") {
            const nameEnquiry = await this.nameEnquiry({ accountNumber: req.recipientId, bankCode: req.recipientBankCode });
            recipientName = nameEnquiry.accountName;
        } else if (req.recipientType === "wallet") {
            recipientWallet = await this.walletRepo.getByUserId(req.recipientId as string);
            if (!recipientWallet) throw new Error("Recipient wallet not found");
            if (recipientWallet.userId === userId) throw new Error("Cannot transfer to yourself");

            const recipientUser = await this.userRepo.getById(recipientWallet.userId as string);
            recipientName = recipientUser?.phoneNumber ?? "";
        }

        if (wallet.balance < req.amount) throw new Error("Insufficient balance");

        const fee = this.calculateTransferFee(req.amount as number);
        const vat = Math.floor(fee * 0.075);
        const totalAmount = req.amount + fee + vat;

        if (wallet.balance < totalAmount) throw new Error("Insufficient balance including fees");

        const reference = this.generateReference("TRF");

        // Debit sender
        await this.walletRepo.debit(wallet.id, totalAmount as number);
        await this.walletRepo.updateSpentLimits(wallet.id, req.amount as number);

        // Credit recipient (wallet transfer)
        if (req.recipientType === "wallet" && recipientWallet) {
            await this.walletRepo.credit(recipientWallet.id as string, req.amount as number);
        }

        // Create transaction
        const transaction = await this.transactionRepo.create({
            reference,
            walletId: wallet.id,
            userId,
            type: "debit",
            category: "transfer",
            amount: req.amount,
            fee,
            vat,
            totalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - totalAmount,
            status: req.recipientType === "wallet" ? "success" : "processing",
            description: req.narration,
            createdAt: new Date(),
            completedAt: req.recipientType === "wallet" ? new Date() : undefined,
        });

        // Create transfer detail
        await this.transferDetailRepo.create({
            transactionId: transaction.id,
            recipientType: req.recipientType,
            recipientId: req.recipientId,
            recipientName,
            recipientBankCode: req.recipientBankCode,
            narration: req.narration,
        });

        // External transfer processing
        if (req.recipientType === "bank") {
            void this.processExternalTransfer(transaction, req);
        }

        return this.mapTransactionToResponse(transaction);
    }

    /** Retry failed transfer */
    async retryTransfer(userId: string, reference: string): Promise<TransactionResponse> {
        const transaction = await this.transactionRepo.getByReference(reference);
        if (!transaction) throw new Error("Transaction not found");
        if (transaction.userId !== userId) throw new Error("Unauthorized");
        if (transaction.status !== "failed") throw new Error("Only failed transactions can be retried");
        if (transaction.retryCount >= 3) throw new Error("Maximum retry attempts reached");

        transaction.retryCount++;
        transaction.status = "processing";
        await this.transactionRepo.update(transaction);

        void this.processExternalTransferRetry(transaction);

        return this.mapTransactionToResponse(transaction);
    }

    /** External transfer processing */
    private async processExternalTransfer(transaction: any, req: any): Promise<void> {
        const resp = await this.redBiller.sendMoney({
            accountNo: req.recipientId,
            bankCode: req.recipientBankCode,
            amount: req.amount,
            narration: req.narration,
            reference: transaction.reference,
        });

        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Transfer failed");
            return;
        }

        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
    }

    private async processExternalTransferRetry(transaction: any): Promise<void> {
        const resp = await this.redBiller.retrySendMoney(transaction.reference as string);
        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Retry failed");
            return;
        }
        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
    }

    /** Name enquiry */
    async nameEnquiry(req: { accountNumber: string; bankCode: string }): Promise<{ accountNumber: string; accountName: string; bankCode: string }> {
        const resp = await this.redBiller.verifyAccountDetails(req.accountNumber, req.bankCode);
        if (!resp?.success) throw new Error("Account verification failed");

        return {
            accountNumber: req.accountNumber,
            accountName: resp.data?.account_name ?? "",
            bankCode: req.bankCode,
        };
    }

    /** Get banks */
    async getBanks(): Promise<{ banks: Array<{ code: string; name: string }> }> {
        const resp = await this.redBiller.fetchBanks("", "NG", "NGN");
        return { banks: resp.data.map((b: any) => ({ code: b.code, name: b.name })) };
    }

    /** Get transfer history */
    async getTransferHistory(userId: string, offset: number, limit: number): Promise<TransactionHistoryResponse> {
        const filters = { category: "transfer" };
        const { transactions, total } = await this.transactionRepo.getByUserID(userId, offset, limit, filters);

        const totalPages = Math.ceil(total / limit);

        return {
            transactions: transactions.map((tx: any) => this.mapTransactionToResponse(tx)),
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages,
        };
    }

    /** Helpers */
    private generateReference(prefix: string): string {
        return `${prefix}${Date.now()}`;
    }

    private calculateTransferFee(amount: number): number {
        const fee = Math.floor(amount * 0.005);
        return fee > 500000 ? 500000 : fee; // cap at ₦5000
    }

    private mapTransactionToResponse(tx: any): TransactionResponse {
        return {
            id: tx.id,
            reference: tx.reference,
            type: tx.type,
            category: tx.category,
            subCategory: tx.subCategory,
            amount: tx.amount,
            amountNaira: tx.amount / 100,
            fee: tx.fee,
            feeNaira: tx.fee / 100,
            totalAmount: tx.totalAmount,
            totalAmountNaira: tx.totalAmount / 100,
            status: tx.status,
            description: tx.description,
            balanceBefore: tx.balanceBefore,
            balanceAfter: tx.balanceAfter,
            createdAt: tx.createdAt,
            completedAt: tx.completedAt,
            transferDetail: tx.transferDetail,
        };
    }
}
