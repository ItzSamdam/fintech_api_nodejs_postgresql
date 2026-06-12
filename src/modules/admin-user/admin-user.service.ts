import { type UserRepository } from "@/modules/_common/repositories/user.repository";
import { type WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { type TransactionRepository } from "@/modules/_common/repositories/transaction.repository";
import { type KYCRepository } from "@/modules/_common/repositories/kyc.repository";
import { type ProviderRepository } from "@/modules/_common/repositories/provider.repository";
import { type AuditLogRepository } from "@/modules/_common/repositories/audit-log.repository";
// import { type AdminUserRepository } from "@/modules/_business/repositories/admin-user.repository";
// import { type RoleRepository } from "@/modules/_business/repositories/role.repository";
import { type UserListResponse, type KYCStatusResponse, type UserDetailResponse } from "@/modules/_common/interfaces/response/auth";
import { type DashboardStatsResponse, type TransactionHistoryResponse, type WalletHistoryResponse, type TransactionResponse, type WalletResponse } from "@/modules/_common/interfaces/response/wallet";
import { type ProviderListResponse } from "@/modules/_common/interfaces/response/bill";
import { type AuditLogResponse, type RevenueReportResponse, type SystemSettings } from "@/modules/_common/interfaces/response/common";

export class AdminService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly walletRepo: WalletRepository,
        private readonly transactionRepo: TransactionRepository,
        private readonly kycRepo: KYCRepository,
        private readonly providerRepo: ProviderRepository,
        private readonly auditLogRepo: AuditLogRepository,
        // private readonly adminUserRepo: AdminUserRepository,
        // private readonly roleRepo: RoleRepository
    ) { }

    /** List users with filters */
    async listUsers(offset: number, limit: number, filters: Record<string, any>): Promise<UserListResponse> {
        const { users, total } = await this.userRepo.list(offset, limit, filters);
        const responses = await Promise.all(
            users.map(async (u: any) => {
                const wallet = await this.walletRepo.getByUserId(u.id as string);
                const kyc = await this.kycRepo.getByUserID(u.id as string);
                return {
                    id: u.id,
                    phoneNumber: u.phoneNumber,
                    email: u.email,
                    tier: u.tier,
                    isActive: u.isActive,
                    isSuspended: u.isSuspended,
                    suspendedAt: u.suspendedAt,
                    kycStatus: kyc?.status ?? "pending",
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                    wallet: wallet
                        ? {
                            id: wallet.id,
                            userId: wallet.userId,
                            balance: wallet.balance,
                            balanceNaira: wallet.balance / 100,
                            currency: wallet.currency,
                            isLocked: wallet.isLocked,
                        }
                        : undefined,
                };
            })
        );
        return {
            users: responses,
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getUserDetails(userId: string): Promise<UserDetailResponse> {
        const user = await this.userRepo.getById(userId);
        if (!user) throw new Error("user not found");

        const wallet = await this.walletRepo.getByUserId(userId);
        const kyc = await this.kycRepo.getByUserID(userId);

        const kycStatus = kyc ? kyc.status : "pending";

        const resp: UserDetailResponse = {
            id: user.id,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            tier: user.tier,
            isActive: user.isActive,
            isSuspended: user.isSuspended,
            suspendedAt: user.suspendedAt,
            kycStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            wallet: wallet ? {
                id: wallet.id,
                userId: wallet.userId,
                balance: wallet.balance,
                balanceNaira: wallet.balance / 100,
                currency: wallet.currency,
                isLocked: wallet.isLocked,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            } : null,
        };

        return resp;
    }

    /** Upgrade user tier */
    async upgradeUserTier(userId: string, tier: number, approvedBy: string): Promise<void> {
        const user = await this.userRepo.getById(userId);
        if (!user) throw new Error("User not found");
        if (tier < user.tier) throw new Error("Cannot downgrade tier");

        await this.userRepo.updateTier(userId, tier);
        await this.auditLogRepo.create({
            adminId: approvedBy,
            userId,
            action: "TIER_UPGRADE",
            entityType: "user",
            entityId: userId,
            oldValue: { tier: user.tier },
            newValue: { tier },
            createdAt: new Date(),
        });
    }

    async suspendUser(userId: string, reason: string, duration?: string): Promise<void> {
        // let dur: number | null = null;
        // if (duration && duration !== "permanent") {
        //     // parse duration string like "7d", "30d"
        //     const days = parseInt(duration.replace("d", ""));
        //     dur = days * 24 * 60 * 60 * 1000; // ms
        // }
        await this.userRepo.suspend(userId, reason);
    }

    async unsuspendUser(userId: string): Promise<void> {
        await this.userRepo.unsuspend(userId);
    }

    async deleteUser(userId: string): Promise<void> {
        await this.userRepo.softDelete(userId);
    }

    // async overrideLimits(userId: string, req: OverrideLimitsRequest): Promise<void> {
        // Implementation for overriding user limits
        // Example: await this.userRepo.overrideLimits(userId, req);
    // }

    async searchUsers(query: string, offset: number, limit: number): Promise<UserListResponse> {
        const { users, total } = await this.userRepo.search(query, offset, limit);
        const responses = await Promise.all(
            users.map(async (u: any) => {
                const wallet = await this.walletRepo.getByUserId(u.id as string);
                const kyc = await this.kycRepo.getByUserID(u.id as string);
                return {
                    id: u.id,
                    phoneNumber: u.phoneNumber,
                    email: u.email,
                    tier: u.tier,
                    isActive: u.isActive,
                    isSuspended: u.isSuspended,
                    suspendedAt: u.suspendedAt,
                    kycStatus: kyc?.status ?? "pending",
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                    wallet: wallet
                        ? {
                            id: wallet.id,
                            userId: wallet.userId,
                            balance: wallet.balance,
                            balanceNaira: wallet.balance / 100,
                            currency: wallet.currency,
                            isLocked: wallet.isLocked,
                        }
                        : undefined,
                };
            })
        );
        return {
            users: responses,
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /** List transactions */
    async listTransactions(offset: number, limit: number, filters: Record<string, any>): Promise<TransactionHistoryResponse> {
        const { transactions, total } = await this.transactionRepo.list(offset, limit, filters);
        return {
            transactions: transactions.map((tx: any) => ({
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
                completedAt: tx.completedAt,
                createdAt: tx.createdAt,
                transferDetail: tx.transferDetail
                    ? {
                        recipientType: tx.transferDetail.recipientType,
                        recipientId: tx.transferDetail.recipientId,
                        recipientName: tx.transferDetail.recipientName,
                        recipientBank: tx.transferDetail.recipientBankName || tx.transferDetail.recipientBankCode,
                        narration: tx.transferDetail.narration,
                    }
                    : undefined,
                billDetail: tx.billDetail
                    ? {
                        billType: tx.billDetail.billType,
                        providerName: tx.billDetail.providerName,
                        phoneNumber: tx.billDetail.phoneNumber,
                        meterNumber: tx.billDetail.meterNumber,
                        customerName: tx.billDetail.customerName,
                        electricityToken: tx.billDetail.electricityToken,
                        dataPlanName: tx.billDetail.dataPlanName,
                        dataVolume: tx.billDetail.dataVolume,
                    }
                    : undefined,
            })),
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTransactionDetails(transactionId: string): Promise<TransactionResponse> {
        const transaction = await this.transactionRepo.getByID(transactionId);
        if (!transaction) throw new Error("Transaction not found");
        return {
            id: transaction.id,
            reference: transaction.reference,
            type: transaction.type,
            category: transaction.category,
            subCategory: transaction.subCategory,
            amount: transaction.amount,
            amountNaira: transaction.amount / 100,
            fee: transaction.fee,
            feeNaira: transaction.fee / 100,
            totalAmount: transaction.totalAmount,
            totalAmountNaira: transaction.totalAmount / 100,
            status: transaction.status,
            description: transaction.description,
            balanceBefore: transaction.balanceBefore,
            balanceAfter: transaction.balanceAfter,
            completedAt: transaction.completedAt,
            createdAt: transaction.createdAt,
            transferDetail: transaction.transferDetail
                ? {
                    recipientType: transaction.transferDetail.recipientType,
                    recipientId: transaction.transferDetail.recipientId,
                    recipientName: transaction.transferDetail.recipientName,
                    recipientBank: transaction.transferDetail.recipientBankName || transaction.transferDetail.recipientBankCode,
                    narration: transaction.transferDetail.narration,
                }
                : undefined,
            billDetail: transaction.billDetail
                ? {
                    billType: transaction.billDetail.billType,
                    providerName: transaction.billDetail.providerName,
                    phoneNumber: transaction.billDetail.phoneNumber,
                    meterNumber: transaction.billDetail.meterNumber,
                    customerName: transaction.billDetail.customerName,
                    electricityToken: transaction.billDetail.electricityToken,
                    dataPlanName: transaction.billDetail.dataPlanName,
                    dataVolume: transaction.billDetail.dataVolume,
                }
                : undefined,
        };
    }

    /** Wallet management */
    async listWallets(offset: number, limit: number, filters: Record<string, any>): Promise<WalletHistoryResponse> {
        const { wallets, total } = await this.walletRepo.list(offset, limit, filters);
        return {
            wallets: wallets.map((w: any) => ({
                id: w.id,
                userId: w.userId,
                balance: w.balance,
                balanceNaira: w.balance / 100,
                currency: w.currency,
                isLocked: w.isLocked,
                createdAt: w.createdAt,
                updatedAt: w.updatedAt,
            })),
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getWalletDetails(walletId: string): Promise<WalletResponse> {
        const wallet = await this.walletRepo.getById(walletId);
        if (!wallet) throw new Error("Wallet not found");
        return {
            id: wallet.id,
            userId: wallet.userId,
            balance: wallet.balance,
            balanceNaira: wallet.balance / 100,
            currency: wallet.currency,
            isLocked: wallet.isLocked,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
    }

    async freezeWallet(walletId: string, note: string): Promise<void> {
        const wallet = await this.walletRepo.getById(walletId);
        if (!wallet) throw new Error("Wallet not found");
        await this.walletRepo.lock(walletId, note);
    }

    async unfreezeWallet(walletId: string): Promise<void> {
        const wallet = await this.walletRepo.getById(walletId);
        if (!wallet) throw new Error("Wallet not found");
        await this.walletRepo.unlock(walletId);
    }

    async getBalanceSummary(): Promise<DashboardStatsResponse> {
        const [balance, totalActiveUser, totalUser] = await Promise.all([
            this.walletRepo.getTotalBalance(),
            this.userRepo.getActiveUsers(),
            this.userRepo.getUserCount()
        ]);

        return {
            totalBalance: balance,
            totalBalanceNaira: balance / 100,
            activeUsers: totalActiveUser,
            totalUsers: totalUser,
        }
    }

    /** KYC management */
    async getPendingKYC(offset: number, limit: number): Promise<{ kycs: KYCStatusResponse[]; total: number }> {
        const { kycList, total } = await this.kycRepo.getPending(offset, limit);
        return {
            kycs: kycList.map((k: any) => ({
                id: k.id,
                userId: k.userId,
                bvnVerified: k.bvnVerified,
                ninVerified: k.ninVerified,
                faceVerified: k.faceVerified,
                status: k.status,
                verifiedAt: k.bvnVerifiedAt,
            })),
            total,
        };
    }

    /** Get KYC details */
    async getKYCDetails(kycId: string): Promise<KYCStatusResponse> {
        const kyc = await this.kycRepo.getByID(kycId);
        if (!kyc) throw new Error("KYC not found");
        return {
            id: kyc.id,
            userId: kyc.userId,
            bvnVerified: kyc.bvnVerified,
            ninVerified: kyc.ninVerified,
            faceVerified: kyc.faceVerified,
            status: kyc.status,
        };
    }

    /** Approve KYC */
    async approveKYC(kycId: string, notes: string, approvedBy: string): Promise<void> {
        const kyc = await this.kycRepo.getByID(kycId);
        if (!kyc) throw new Error("KYC not found");
        await this.kycRepo.approve(kycId, notes);
        await this.auditLogRepo.create({
            adminId: approvedBy,
            userId: kyc.userId,
            action: "KYC_APPROVED",
            entityType: "user",
            entityId: kyc.userId,
            oldValue: { status: kyc.status },
            newValue: { status: "approved" },
            createdAt: new Date(),
        });
    }

    /** Reject KYC */
    async rejectKYC(kycId: string, reason: string, approvedBy: string): Promise<void> {
        const kyc = await this.kycRepo.getByID(kycId);
        if (!kyc) throw new Error("KYC not found");
        await this.kycRepo.reject(kycId, reason);
        await this.auditLogRepo.create({
            adminId: approvedBy,
            userId: kyc.userId,
            action: "KYC_REJECTED",
            entityType: "user",
            entityId: kyc.userId,
            oldValue: { status: kyc.status },
            newValue: { status: "rejected" },
            createdAt: new Date(),
        });
    }

    /** Provider management */
    async listProviders(offset: number, limit: number, filters: Record<string, any>): Promise<ProviderListResponse> {
        const { providers, total } = await this.providerRepo.list(offset, limit, filters);
        return {
            providers: providers.map((p: any) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                category: p.category,
                isActive: p.isActive,
            })),
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /** Reports */
    async getDailyReport(date: Date): Promise<RevenueReportResponse> {
        return {
            period: date.toISOString().split("T")[0],
            totalRevenue: 0,
            revenueByBillType: {},
            feeBreakdown: {},
        };
    }

    async getMonthlyReport(year: number, month: number): Promise<RevenueReportResponse> {
        return {
            period: `${year}-${month.toString().padStart(2, "0")}`,
            totalRevenue: 0,
            revenueByBillType: {},
            feeBreakdown: {},
        };
    }

    /** System settings */
    async getSystemSettings(): Promise<SystemSettings> {
        return {
            maintenanceMode: false,
            maintenanceMessage: "",
            globalDailyLimit: 0,
            globalSingleTxLimit: 0,
            maxRetryCount: 3,
            sessionTimeout: 3600,
        };
    }

    /** Audit logs */
    async getAuditLogs(offset: number, limit: number, filters: Record<string, any>): Promise<AuditLogResponse> {
        const { logs, total } = await this.auditLogRepo.list(offset, limit, filters);
        return {
            logs: logs.map((l: any) => ({
                id: l.id,
                action: l.action,
                entityType: l.entityType,
                entityId: l.entityId,
                ipAddress: l.ipAddress,
                createdAt: l.createdAt,
            })),
            total,
        };
    }
}

