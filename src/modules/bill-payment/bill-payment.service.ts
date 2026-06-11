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
        void this.processAirtimePurchase(transaction, req);

        return this.mapTransactionToResponse(transaction);
    }

    private async processAirtimePurchase(transaction: any, req: any): Promise<void> {
        const resp = await this.redBiller.purchaseTopUp({
            product: req.network,
            phoneNo: req.phoneNumber,
            amount: req.amount,
            ported: false,
            reference: transaction.reference,
        });

        if (!resp?.success) {
            await this.transactionRepo.markAsFailed(transaction.reference as string, resp?.message ?? "Airtime purchase failed");
            return;
        }

        await this.transactionRepo.updateStatus(transaction.reference as string, "success", new Date());
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
