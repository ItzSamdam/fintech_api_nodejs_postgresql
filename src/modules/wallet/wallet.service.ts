import { type WalletRepository } from "@/modules/_business/repositories/wallet.repository";
import { type TransactionRepository } from "@/modules/_business/repositories/transaction.repository";
import { type UserRepository } from "@/modules/_business/repositories/user.repository";
import { type TierLimits, type TransactionResponse, type BalanceResponse, type TransactionHistoryResponse, type WalletResponse } from "@/modules/_business/interfaces/response/wallet";
import { type TierLimitResponse } from "@/modules/_business/interfaces/response/auth";

export class WalletService {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly userRepo: UserRepository
  ) { }

  async createWallet(userId: string, currency = "NGN"): Promise<WalletResponse> {
    const existing = await this.walletRepo.getByUserId(userId);
    if (existing) throw new Error("Wallet already exists for this user");

    const wallet = await this.walletRepo.create({
      userId,
      balance: 0,
      currency,
    });

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

  async getBalance(userId: string): Promise<BalanceResponse> {
    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    return {
      balance: wallet.balance,
      balanceNaira: wallet.balance / 100,
      currency: wallet.currency,
      isLocked: wallet.isLocked,
    };
  }

  async getTransactions(userId: string, record: Record<string, any>): Promise<TransactionHistoryResponse> {
    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    const page = record.page > 0 ? record.page : 1;
    const requestLimit: number = record.limit > 0 ? record.limit : 20;
    const limit = Math.min(requestLimit > 0 ? requestLimit : 20, 100);
    const offset = (page - 1) * limit;

    const filters: Record<string, any> = {};
    if (record.category) filters.category = record.category;
    if (record.status) filters.status = record.status;
    if (record.fromDate) filters.fromDate = record.fromDate;
    if (record.toDate) filters.toDate = record.toDate;

    const { transactions, total } = await this.transactionRepo.getByWalletID(wallet.id, offset, limit, filters);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map((tx: any) => this.mapTransactionToResponse(tx)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getLimits(userId: string): Promise<TierLimitResponse> {
    const user = await this.userRepo.getById(userId);
    if (!user) throw new Error("User not found");

    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    const limits = this.getTierLimits(user.tier);

    return {
      tier: user.tier,
      dailyLimit: limits.dailyLimit,
      weeklyLimit: limits.weeklyLimit,
      monthlyLimit: limits.monthlyLimit,
      singleTxLimit: limits.singleTxLimit,
      dailySpent: wallet.dailySpent,
      weeklySpent: wallet.weeklySpent,
      monthlySpent: wallet.monthlySpent,
      dailyRemaining: limits.dailyLimit - wallet.dailySpent,
      weeklyRemaining: limits.weeklyLimit - wallet.weeklySpent,
      monthlyRemaining: limits.monthlyLimit - wallet.monthlySpent,
    };
  }

  async lockWallet(userId: string, reason: string): Promise<void> {
    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    await this.walletRepo.lock(wallet.id, reason);
  }

  async unlockWallet(userId: string): Promise<void> {
    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    await this.walletRepo.unlock(wallet.id);
  }

  async getStatement(userId: string, req: any): Promise<{ data: Buffer; mimeType: string }> {
    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    const filters = { fromDate: req.fromDate, toDate: req.toDate };
    const { transactions } = await this.transactionRepo.getByWalletID(wallet.id, 0, 10000, filters);

    const csv = this.generateCSVStatement(transactions);
    return { data: Buffer.from(csv), mimeType: "text/csv" };
  }

  async getTransactionByID(userId: string, transactionId: string): Promise<TransactionResponse> {
    const wallet = await this.walletRepo.getByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    const transaction = await this.transactionRepo.getByID(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.userId !== userId) throw new Error("Unauthorized to view this transaction");

    return this.mapTransactionToResponse(transaction);
  }

  private mapTransactionToResponse(tx: any): TransactionResponse {
    return {
      id: tx.id,
      reference: tx.reference,
      type: tx.type,
      category: tx.category,
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
      billDetail: tx.billDetail,
    };
  }

  private generateCSVStatement(transactions: any[]): string {
    let csv = "Date,Reference,Type,Category,Amount (NGN),Fee (NGN),Total (NGN),Status,Balance Before (NGN),Balance After (NGN),Description\n";
    for (const tx of transactions) {
      csv += `${tx.createdAt},${tx.reference},${tx.type},${tx.category},${tx.amount / 100},${tx.fee / 100},${tx.totalAmount / 100},${tx.status},${tx.balanceBefore / 100},${tx.balanceAfter / 100},${tx.description}\n`;
    }
    return csv;
  }

  private getTierLimits(tier: number): TierLimits {
    const limits: Record<number, any> = {
      0: { dailyLimit: 0, weeklyLimit: 0, monthlyLimit: 0, singleTxLimit: 0 },
      1: { dailyLimit: 5000000, weeklyLimit: 20000000, monthlyLimit: 50000000, singleTxLimit: 2500000 },
      2: { dailyLimit: 20000000, weeklyLimit: 100000000, monthlyLimit: 300000000, singleTxLimit: 10000000 },
      3: { dailyLimit: 500000000, weeklyLimit: 2000000000, monthlyLimit: 5000000000, singleTxLimit: 500000000 },
    };
    return limits[tier] || limits[0];
  }
}
