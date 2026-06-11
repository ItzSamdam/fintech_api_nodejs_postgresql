import { type WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { type TransactionRepository } from "@/modules/_common/repositories/transaction.repository";
import { type BillDetailRepository } from "@/modules/_common/repositories/bill-detail.repository";
import { type ProviderRepository } from "@/modules/_common/repositories/provider.repository";
import { type UserRepository } from "@/modules/_common/repositories/user.repository";
import { type RedBillerClient } from "@/modules/_common/registry/redbiller.client.registry";
import {
    type NetworkListResponse,
    type DataPlanResponse,
    type ProviderResponse,
    type MeterValidationResponse,
    type BettingAccountResponse,
} from "@/modules/_common/interfaces/response/bill";
import { type TransactionResponse } from "@/modules/_common/interfaces/response/wallet";

export class BillPaymentService {
    constructor(
        private readonly walletRepo: WalletRepository,
        private readonly transactionRepo: TransactionRepository,
        private readonly billDetailRepo: BillDetailRepository,
        private readonly providerRepo: ProviderRepository,
        private readonly userRepo: UserRepository,
        private readonly redBiller: RedBillerClient
    ) { }

    private readonly callbackUrl = "https://api.verifaxpay.ng/webhooks/redbiller";

    /** Airtime networks */
    async getAirtimeNetworks(): Promise<NetworkListResponse> {
        return {
            networks: [
                { code: "MTN", name: "MTN Nigeria", logoUrl: "", isActive: true },
                { code: "GLO", name: "Glo Nigeria", logoUrl: "", isActive: true },
                { code: "AIRTEL", name: "Airtel Nigeria", logoUrl: "", isActive: true },
                { code: "9MOBILE", name: "9mobile", logoUrl: "", isActive: true },
            ],
        };
    }

    /** Purchase airtime */
    async purchaseAirtime(userId: string, req: any): Promise<TransactionResponse> {
        const wallet = await this.walletRepo.getByUserIdForUpdate(userId);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.isLocked) throw new Error("Wallet is locked");

        const fee = this.calculateBillFee("airtime", req.amount as number);
        const vat = Math.floor(fee * 0.075);
        const totalAmount = req.amount + fee + vat;

        if (wallet.balance < totalAmount) throw new Error("Insufficient balance");

        const reference = this.generateReference("AIR");

        await this.walletRepo.debit(wallet.id, totalAmount as number);

        const transaction = await this.transactionRepo.create({
            reference,
            walletId: wallet.id,
            userId,
            type: "debit",
            category: "airtime",
            subCategory: req.network,
            amount: req.amount,
            fee,
            vat,
            totalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - totalAmount,
            status: "processing",
            description: `Airtime purchase for ${req.phoneNumber}`,
            createdAt: new Date(),
        });

        await this.billDetailRepo.create({
            transactionId: transaction.id,
            billType: "airtime",
            phoneNumber: req.phoneNumber,
            providerName: req.network,
        });

        // Async external purchase
        void this.processAirtimePurchase(transaction, {
            product: req.network,
            phoneNo: req.phoneNumber,
            amount: req.amount,
            ported: false,
            reference: transaction.reference,
        });

        return this.mapTransactionToResponse(transaction);
    }

    private async processAirtimePurchase(transaction: any, req: {
        product: string,
        phoneNo: string,
        amount: string,
        ported: boolean,
        reference: string,
    }): Promise<void> {
        const resp = await this.redBiller.purchaseTopUp(
            req.product,
            req.phoneNo,
            req.amount,
            req.ported,
            this.callbackUrl,
            req.reference,
        );

        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Airtime purchase failed");
            return;
        }

        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
    }

    async getAirtimeHistory(userId: string, offset: number, limit: number): Promise<{ transactions: TransactionResponse[]; total: number }> {
        const { transactions } = await this.transactionRepo.getByCategory(userId, "airtime", offset, limit);
        return { transactions: transactions.map((t: any) => this.mapTransactionToResponse(t)), total: transactions.length };
    }

    /** Data networks */
    async getDataNetworks(): Promise<NetworkListResponse> {
        return {
            networks: [
                { code: "MTN", name: "MTN Data", logoUrl: "", isActive: true },
                { code: "GLO", name: "Glo Data", logoUrl: "", isActive: true },
                { code: "AIRTEL", name: "Airtel Data", logoUrl: "", isActive: true },
                { code: "9MOBILE", name: "9mobile Data", logoUrl: "", isActive: true },
            ],
        };
    }

    async getDataPlans(network: string): Promise<DataPlanResponse[]> {
        const resp = await this.redBiller.getDataPlans(network);
        return resp.data.map((plan: any) => ({
            id: plan.code,
            name: plan.name,
            volume: plan.size,
            price: plan.amount,
            priceNaira: plan.amount,
            validity: plan.validity,
            network,
        }));
    }

    async purchaseData(userId: string, req: any): Promise<TransactionResponse> {
        const wallet = await this.walletRepo.getByUserIdForUpdate(userId);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.isLocked) throw new Error("Wallet is locked");

        const fee = this.calculateBillFee("data", req.amount as number);
        const vat = Math.floor(fee * 0.075);
        const totalAmount = req.amount + fee + vat;

        if (wallet.balance < totalAmount) throw new Error("Insufficient balance");

        const reference = this.generateReference("DATA");

        await this.walletRepo.debit(wallet.id, totalAmount as number);

        const transaction = await this.transactionRepo.create({
            reference,
            walletId: wallet.id,
            userId,
            type: "debit",
            category: "data",
            subCategory: req.network,
            amount: req.amount,
            fee,
            vat,
            totalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - totalAmount,
            status: "processing",
            description: `Data purchase for ${req.phoneNumber}`,
            createdAt: new Date(),
        });

        await this.billDetailRepo.create({
            transactionId: transaction.id,
            billType: "data",
            phoneNumber: req.phoneNumber,
            providerName: req.network,
        });

        // Async external purchase
        void this.processDataPurchase(transaction, {
            product: req.network,
            phoneNo: req.phoneNumber,
            code: req.code,
            ported: false,
            reference: transaction.reference,
        });

        return this.mapTransactionToResponse(transaction);
    }

    private async processDataPurchase(transaction: any, req: {
        product: string,
        phoneNo: string,
        code: string,
        ported: boolean,
        reference: string,
    }): Promise<void> {
        const resp = await this.redBiller.purchaseData(
            req.product,
            req.phoneNo,
            req.code,
            req.ported,
            this.callbackUrl,
            req.reference
        );
        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Data purchase failed");
            return;
        }
        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
    }

    async getDataHistory(userId: string, offset: number, limit: number): Promise<{ transactions: TransactionResponse[]; total: number }> {
        const { transactions } = await this.transactionRepo.getByCategory(userId, "data", offset, limit);
        return { transactions: transactions.map((t: any) => this.mapTransactionToResponse(t)), total: transactions.length };
    }

    /** Electricity providers */
    async getElectricityProviders(): Promise<ProviderResponse[]> {
        const providers = await this.providerRepo.getActiveByType("electricity");
        return providers.map((p: any) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            category: p.category,
            isActive: p.isActive,
        }));
    }

    async validateMeter(req: any): Promise<MeterValidationResponse> {
        const resp = await this.redBiller.verifyDisco(req.providerId as string, req.meterNumber as string, req.meterType as string);
        if (!resp?.success) throw new Error("Meter validation failed");

        return {
            customerName: resp.data.customer_name ?? "",
            customerAddress: resp.data.address ?? "",
            meterNumber: req.meterNumber,
            meterType: req.meterType,
            providerId: req.providerId,
            providerName: resp.data.provider_name ?? "",
        };
    }

    async payElectricity(userId: string, req: any): Promise<TransactionResponse> {
        const wallet = await this.walletRepo.getByUserIdForUpdate(userId);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.isLocked) throw new Error("Wallet is locked");

        const fee = this.calculateBillFee("electricity", req.amount as number);
        const vat = Math.floor(fee * 0.075);
        const totalAmount = req.amount + fee + vat;

        if (wallet.balance < totalAmount) throw new Error("Insufficient balance");

        const reference = this.generateReference("ELEC");

        await this.walletRepo.debit(wallet.id, totalAmount as number);

        const transaction = await this.transactionRepo.create({
            reference,
            walletId: wallet.id,
            userId,
            type: "debit",
            category: "electricity",
            subCategory: req.providerId,
            amount: req.amount,
            fee,
            vat,
            totalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - totalAmount,
            status: "processing",
            description: `Electricity payment for ${req.meterNumber}`,
            createdAt: new Date(),
        });

        await this.billDetailRepo.create({
            transactionId: transaction.id,
            billType: "electricity",
            meterNumber: req.meterNumber,
            meterType: req.meterType,
            providerName: req.providerId,
        });

        // Async external payment
        void this.processElectricityPayment(transaction, {
            product: req.providerId,
            meterNo: req.meterNumber,
            customerName: req.customerName,
            meterType: req.meterType,
            phoneNo: req.phoneNumber,
            amount: req.amount,
            reference: req.reference,
        });

        return this.mapTransactionToResponse(transaction);
    }

    private async processElectricityPayment(transaction: any, req: {
        product: string,
        meterNo: string,
        customerName: string,
        meterType: string,
        phoneNo: string,
        amount: string,
        reference: string,
    }): Promise<void> {
        const resp = await this.redBiller.purchaseDisco(
            req.product,
            req.meterNo,
            req.customerName,
            req.meterType,
            req.phoneNo,
            req.amount,
            this.callbackUrl,
            req.reference
        );
        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Electricity payment failed");
            return;
        }
        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
    }

    async getElectricityToken(userId: string, transactionId: string): Promise<any> {
        const transaction = await this.transactionRepo.getByID(transactionId);
        if (!transaction) throw new Error("Transaction not found");
        if (transaction.userId !== userId) throw new Error("Unauthorized");
        const billDetail = await this.billDetailRepo.getByTransactionID(transaction.id);
        if (!billDetail) throw new Error("Bill detail not found");

        return {
            token: billDetail.electricityToken,
            units: billDetail.electricityUnits,
        };
    }

    async getElectricityHistory(userId: string, offset: number, limit: number): Promise<{ transactions: TransactionResponse[]; total: number }> {
        const { transactions } = await this.transactionRepo.getByCategory(userId, "electricity", offset, limit);
        return { transactions: transactions.map((t: any) => this.mapTransactionToResponse(t)), total: transactions.length };
    }

    /** Betting providers */
    async getBettingProviders(): Promise<ProviderResponse[]> {
        const resp = await this.redBiller.getBetProviders();
        return resp.data.map((p: any) => ({
            id: p.code,
            name: p.name,
            code: p.code,
            category: "betting",
            isActive: true,
        }));
    }

    async validateBettingAccount(req: any): Promise<BettingAccountResponse> {
        const resp = await this.redBiller.verifyBetWallet(req.providerId as string, req.accountId as string);
        if (!resp?.success) throw new Error("Account validation failed");

        return {
            providerId: req.providerId,
            providerName: resp.data.provider_name ?? "",
            accountId: req.accountId,
            accountName: resp.data.customer_name ?? "",
            isValid: true,
        };
    }

    async fundBettingWallet(userId: string, req: any): Promise<TransactionResponse> {
        const wallet = await this.walletRepo.getByUserIdForUpdate(userId);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.isLocked) throw new Error("Wallet is locked");

        const fee = this.calculateBillFee("betting", req.amount as number);
        const vat = Math.floor(fee * 0.075);
        const totalAmount = req.amount + fee + vat;

        if (wallet.balance < totalAmount) throw new Error("Insufficient balance");

        const reference = this.generateReference("BET");

        await this.walletRepo.debit(wallet.id, totalAmount as number);

        const transaction = await this.transactionRepo.create({
            reference,
            walletId: wallet.id,
            userId,
            type: "debit",
            category: "betting",
            subCategory: req.network,
            amount: req.amount,
            fee,
            vat,
            totalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - totalAmount,
            status: "processing",
            description: `Betting wallet funding for ${req.phoneNumber}`,
            createdAt: new Date(),
        });

        await this.billDetailRepo.create({
            transactionId: transaction.id,
            billType: "betting",
            phoneNumber: req.phoneNumber,
            providerName: req.network,
        });

        // Async external payment
        void this.processBettingFunding(transaction, {
            product: req.providerId as string,
            customerId: req.customerId as string,
            amount: req.amount as string,
            phoneNo: req.phoneNo as string,
            callbackUrl: this.callbackUrl,
            reference: req.reference as string,
        });

        return this.mapTransactionToResponse(transaction);
    }

    private async processBettingFunding(transaction: any, req: {
        product: string,
        customerId: string,
        amount: string,
        phoneNo: string,
        callbackUrl: string,
        reference: string,
    }): Promise<void> {
        const resp = await this.redBiller.creditBetWallet(
            req.product,
            req.customerId,
            req.amount,
            req.phoneNo,
            this.callbackUrl,
            req.reference
        );
        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Betting wallet funding failed");
            return;
        }

        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
    }

    async getBettingHistory(userId: string, offset: number, limit: number): Promise<{ transactions: TransactionResponse[]; total: number }> {
        const { transactions } = await this.transactionRepo.getByCategory(userId, "betting", offset, limit);
        return { transactions: transactions.map((t: any) => this.mapTransactionToResponse(t)), total: transactions.length };
    }

    async getBillHistory(userId: string, offset: number, limit: number): Promise<{ transactions: TransactionResponse[]; total: number }> {
        const { transactions } = await this.transactionRepo.getByCategory(userId, "bill", offset, limit);
        return { transactions: transactions.map((t: any) => this.mapTransactionToResponse(t)), total: transactions.length };
    }


    /** Helpers */
    private generateReference(prefix: string): string {
        return `${prefix}${Date.now()}`;
    }

    private calculateBillFee(billType: string, amount: number): number {
        const feePercentages: Record<string, number> = {
            airtime: 0.01,
            data: 0.01,
            electricity: 100, // fixed NGN
            betting: 0.015,
        };

        if (billType === "electricity") return 10000; // 100 NGN in kobo

        const fee = Math.floor(amount * (feePercentages[billType] ?? 0));
        return fee > 100000 ? 100000 : fee; // cap at 1000 NGN
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
            billDetail: tx.billDetail,
        };
    }
}
