import { type UserRepository } from "@/modules/_common/repositories/user.repository";
import { type WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { type TransactionRepository } from "@/modules/_common/repositories/transaction.repository";
import { type KYCRepository } from "@/modules/_common/repositories/kyc.repository";
import { type ProviderRepository } from "@/modules/_common/repositories/provider.repository";
import { type AuditLogRepository } from "@/modules/_common/repositories/audit-log.repository";
import { type AdminUserRepository } from "@/modules/_common/repositories/admin-user.repository";
import { type RoleRepository } from "@/modules/_common/repositories/role.repository";
import { type UserListResponse, type KYCStatusResponse, type UserDetailResponse } from "@/modules/_common/interfaces/response/auth";
import { type DashboardStatsResponse, type TransactionHistoryResponse, type WalletHistoryResponse, type TransactionResponse, type WalletResponse } from "@/modules/_common/interfaces/response/wallet";
import { type ProviderListResponse } from "@/modules/_common/interfaces/response/bill";
import { type Logs, type AuditLogResponse, type RevenueReportResponse, type SystemSettings } from "@/modules/_common/interfaces/response/common";
import { type Provider } from "@/shared/database/models";

export class AdminService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly walletRepo: WalletRepository,
        private readonly transactionRepo: TransactionRepository,
        private readonly kycRepo: KYCRepository,
        private readonly providerRepo: ProviderRepository,
        private readonly auditLogRepo: AuditLogRepository,
        private readonly adminUserRepo: AdminUserRepository,
        private readonly roleRepo: RoleRepository
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

    // ========== PROVIDER MANAGEMENT ==========
    async listProviders(offset: number, limit: number, filters: Record<any, string>): Promise<ProviderListResponse> {
        let providerList: Provider[];
        let total: number;

        if (filters.providerType) {
            providerList = await this.providerRepo.getByType(filters.providerType);
            total = providerList.length;
        } else {
            const result = await this.providerRepo.list(offset, limit, filters);
            providerList = result.providers;
            total = result.total;
        }

        return {
            providers: providerList.map(p => ({
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

    async toggleProvider(providerId: string, isActive: boolean): Promise<void> {
        await this.providerRepo.toggleActive(providerId, isActive);
    }

    async setProviderPriority(providerId: string, priority: number): Promise<void> {
        await this.providerRepo.updatePriority(providerId, priority);
    }

    async checkProviderHealth(providerId: string): Promise<string> {
        // Implementation for health check
        return "healthy";
    }

    async getProviderLogs(providerId: string, page: number, limit: number): Promise<{ logs: any[]; total: number }> {
        // Implementation for provider logs
        return { logs: [], total: 0 };
    }

    // ========== REPORTS ==========
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
            period: `${year}-${String(month).padStart(2, "0")}`,
            totalRevenue: 0,
            revenueByBillType: {},
            feeBreakdown: {},
        };
    }

    async getRevenueByBillType(startDate: string, endDate: string): Promise<Record<string, number>> {
        return {};
    }

    async getTopUsers(limit: number): Promise<UserDetailResponse[]> {
        return [];
    }

    async getFraudStats(): Promise<any> {
        return {};
    }

    // async getProviderPerformance(startDate: string, endDate: string): Promise<ProviderPerformanceResponse[]> {
    //     return [];
    // }

    async exportReport(reportType: string, format: string, startDate: string, endDate: string): Promise<{ data: Buffer; format: string }> {
        return { data: Buffer.from(""), format: "csv" };
    }

    // ========== SYSTEM SETTINGS ==========
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

    // async updateSystemSettings(req: SystemSettingsRequest): Promise<void> {
    //     // Implementation for updating settings
    // }

    async healthCheck(): Promise<any> {
        return { status: "healthy", database: "connected" };
    }

    async getAuditLogs(offset: number, limit: number, filters: Record<string, any>): Promise<AuditLogResponse> {
        const { logs, total } = await this.auditLogRepo.list(offset, limit, filters);
        const responses = logs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt,
        }));
        return { logs: responses, total };
    }

    async getAuditLog(logId: string): Promise<Logs> {
        const log = await this.auditLogRepo.getByID(logId);
        if (!log) throw new Error("Audit log not found");
        return {
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt,
        };
    }

    async triggerDatabaseBackup(): Promise<any> {
        return { backupId: "", status: "started" };
    }

    async getSystemMetrics(): Promise<any> {
        return {
            cpuUsage: 15.5,
            memoryUsage: 256.0,
            uptime: "5d 3h 22m",
            dbConnections: 10,
        };
    }

    // ========== ROLE MANAGEMENT ==========
    async listRoles(): Promise<any[]> {
        const roles = await this.roleRepo.list();
        return roles.map((role: { id: any; name: any; permissions: any; description: any; }) => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions,
            description: role.description,
        }));
    }

    async createRole(req: any): Promise<any> {
        const role = {
            name: req.name,
            // permissions: JSON.stringify(req.permissions),
            description: req.description,
        };
        await this.roleRepo.create(role);
        return role;
    }

    async updateRole(roleId: string, req: any): Promise<any> {
        const role = await this.roleRepo.getByID(roleId);
        if (!role) throw new Error("role not found");

        role.name = req.name;
        // role.permissions = JSON.stringify(req.permissions);
        role.description = req.description;

        await this.roleRepo.update(role);
        return role;
    }

    async deleteRole(roleId: string): Promise<void> {
        await this.roleRepo.delete(roleId);
    }

    async listStaff(offset: number, limit: number): Promise<{ staff: any[]; total: number }> {
        const { admins, total } = await this.adminUserRepo.list(offset, limit);
        const result = admins.map((admin: { id: any; email: any; fullName: any; role: any; isActive: any; createdAt: any; }) => ({
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
        }));
        return { staff: result, total };
    }

    async inviteStaff(req: any): Promise<void> {
        const admin = {
            email: req.email,
            fullName: req.fullName,
            role: req.role,
            isActive: true,
        };
        await this.adminUserRepo.create(admin);
    }

    async assignRole(staffId: string, role: string): Promise<void> {
        await this.adminUserRepo.updateRole(staffId, role);
    }

    async removeStaff(staffId: string): Promise<void> {
        await this.adminUserRepo.delete(staffId);
    }

    async getStaffAudit(staffId: string, offset: number, limit: number): Promise<AuditLogResponse> {
        const { logs, total } = await this.auditLogRepo.getByAdminID(staffId, offset, limit);
        const responses = logs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt,
        }));
        return { logs: responses, total };
    }
}

