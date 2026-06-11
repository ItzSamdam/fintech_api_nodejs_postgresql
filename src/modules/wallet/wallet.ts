// // src/services/wallet.service.ts
// import { v4 as uuidv4 } from "uuid";
// import { WalletRepository } from "@/repositories/wallet.repository";
// import { TransactionRepository } from "@/repositories/transaction.repository";
// import { UserRepository } from "@/repositories/user.repository";
// import { RateLimitCache, CacheRepository } from "@/cache/cache.repository";

// export class WalletService {
//     constructor(
//         private walletRepo: WalletRepository,
//         private transactionRepo: TransactionRepository,
//         private userRepo: UserRepository,
//         private cache: CacheRepository,
//         private rateLimitCache: RateLimitCache
//     ) { }

//     async createWallet(userId: string, currency = "NGN") {
//         const existing = await this.walletRepo.getByUserID(userId);
//         if (existing) throw new Error("Wallet already exists for this user");

//         const wallet = await this.walletRepo.create({
//             id: uuidv4(),
//             userId,
//             balance: 0,
//             currency,
//         });

//         return this.mapWalletResponse(wallet);
//     }

//     async getBalance(userId: string) {
//         const cacheKey = `wallet:balance:${userId}`;
//         const cached = await this.cache.get<any>(cacheKey);
//         if (cached) return cached;

//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");

//         const balanceResponse = {
//             balance: wallet.balance,
//             balanceNaira: wallet.balance / 100,
//             currency: wallet.currency,
//             isLocked: wallet.isLocked,
//         };

//         await this.cache.set(cacheKey, balanceResponse, 60); // cache for 1 minute
//         return balanceResponse;
//     }

//     async getTransactions(userId: string, req: any) {
//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");

//         const page = req.page > 0 ? req.page : 1;
//         const limit = Math.min(req.limit > 0 ? req.limit : 20, 100);
//         const offset = (page - 1) * limit;

//         const filters: any = {};
//         if (req.category) filters.category = req.category;
//         if (req.status) filters.status = req.status;
//         if (req.fromDate) filters.fromDate = req.fromDate;
//         if (req.toDate) filters.toDate = req.toDate;

//         const { transactions, total } = await this.transactionRepo.getByWalletID(wallet.id, offset, limit, filters);
//         const totalPages = Math.ceil(total / limit);

//         return {
//             transactions: transactions.map((tx: any) => this.mapTransactionToResponse(tx)),
//             total,
//             page,
//             limit,
//             totalPages,
//         };
//     }

//     async getLimits(userId: string) {
//         const user = await this.userRepo.getByID(userId);
//         if (!user) throw new Error("User not found");

//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");

//         const limits = this.getTierLimits(user.tier);

//         return {
//             tier: user.tier,
//             dailyLimit: limits.dailyLimit,
//             weeklyLimit: limits.weeklyLimit,
//             monthlyLimit: limits.monthlyLimit,
//             singleTxLimit: limits.singleTxLimit,
//             dailySpent: wallet.dailySpent,
//             weeklySpent: wallet.weeklySpent,
//             monthlySpent: wallet.monthlySpent,
//             dailyRemaining: limits.dailyLimit - wallet.dailySpent,
//             weeklyRemaining: limits.weeklyLimit - wallet.weeklySpent,
//             monthlyRemaining: limits.monthlyLimit - wallet.monthlySpent,
//         };
//     }

//     async lockWallet(userId: string, reason: string) {
//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");
//         await this.walletRepo.lock(wallet.id, reason);
//         await this.cache.delete(`wallet:balance:${userId}`); // invalidate cache
//     }

//     async unlockWallet(userId: string) {
//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");
//         await this.walletRepo.unlock(wallet.id);
//         await this.cache.delete(`wallet:balance:${userId}`); // invalidate cache
//     }

//     async getStatement(userId: string, req: any) {
//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");

//         const filters = { fromDate: req.fromDate, toDate: req.toDate };
//         const { transactions } = await this.transactionRepo.getByWalletID(wallet.id, 0, 10000, filters);

//         const csv = this.generateCSVStatement(transactions);
//         return { data: Buffer.from(csv), mimeType: "text/csv" };
//     }

//     async getTransactionByID(userId: string, transactionId: string) {
//         const wallet = await this.walletRepo.getByUserID(userId);
//         if (!wallet) throw new Error("Wallet not found");

//         const transaction = await this.transactionRepo.getByID(transactionId);
//         if (!transaction) throw new Error("Transaction not found");
//         if (transaction.userId !== userId) throw new Error("Unauthorized to view this transaction");

//         return this.mapTransactionToResponse(transaction);
//     }

//     /** Rate limiting example: prevent too many withdrawals */
//     async checkWithdrawalRateLimit(userId: string): Promise<void> {
//         const key = `rate:withdrawal:${userId}`;
//         const count = await this.rateLimitCache.incrementRequest(key, 60); // 1-minute window
//         if (count > 5) throw new Error("Too many withdrawal attempts, please try again later");
//     }

//     // Helpers
//     private mapWalletResponse(wallet: any) {
//         return {
//             id: wallet.id,
//             userId: wallet.userId,
//             balance: wallet.balance,
//             balanceNaira: wallet.balance / 100,
//             currency: wallet.currency,
//             isLocked: wallet.isLocked,
//             createdAt: wallet.createdAt,
//             updatedAt: wallet.updatedAt,
//         };
//     }

//     private mapTransactionToResponse(tx: any) {
//         return {
//             id: tx.id,
//             reference: tx.reference,
//             type: tx.type,
//             category: tx.category,
//             amount: tx.amount,
//             amountNaira: tx.amount / 100,
//             fee: tx.fee,
//             feeNaira: tx.fee / 100,
//             totalAmount: tx.totalAmount,
//             totalAmountNaira: tx.totalAmount / 100,
//             status: tx.status,
//             description: tx.description,
//             balanceBefore: tx.balanceBefore,
//             balanceAfter: tx.balanceAfter,
//             createdAt: tx.createdAt,
//             completedAt: tx.completedAt,
//             transferDetail: tx.transferDetail,
//             billDetail: tx.billDetail,
//         };
//     }

//     private generateCSVStatement(transactions: any[]): string {
//         let csv = "Date,Reference,Type,Category,Amount (NGN),Fee (NGN),Total (NGN),Status,Balance Before (NGN),Balance After (NGN),Description\n";
//         for (const tx of transactions) {
//             csv += `${tx.createdAt},${tx.reference},${tx.type},${tx.category},${tx.amount / 100},${tx.fee / 100},${tx.totalAmount / 100},${tx.status},${tx.balanceBefore / 100},${tx.balanceAfter / 100},${tx.description}\n`;
//         }
//         return csv;
//     }

//     private getTierLimits(tier: number) {
//         const limits: Record<number, any> = {
//             0: { dailyLimit: 0, weeklyLimit: 0, monthlyLimit: 0, singleTxLimit: 0 },
//             1: { dailyLimit: 5000000, weeklyLimit: 20000000, monthlyLimit: 50000000, singleTxLimit: 2500000 },
//             2: { dailyLimit: 20000000, weeklyLimit: 100000000, monthlyLimit: 300000000, singleTxLimit: 10000000 },
//             3: { dailyLimit: 500000000, weeklyLimit: 2000000000, monthlyLimit: 5000000000, singleTxLimit: 500000000 },
//         };
//         return limits[tier] || limits[0];
//     }
// }
