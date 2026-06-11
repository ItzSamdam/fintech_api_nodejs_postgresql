import type Transaction from "@/shared/database/models/transaction.model";
import type TransferDetail from "@/shared/database/models/transfer-detail.model";

export interface TransactionSummary {
  totalCount: number;
  totalAmount: number;
  totalFee: number;
  totalVAT: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
}

export interface AdminTransactionSummary {
  totalVolume: number;
  totalRevenue: number;
  totalFee: number;
  totalVAT: number;
  successRate: number;
}


export interface TransactionRepository {
  create: (transaction: Transaction) => Promise<void>;
  update: (transaction: Transaction) => Promise<void>;
  getByID: (id: string) => Promise<Transaction | null>;
  getByReference: (reference: string) => Promise<Transaction | null>;
  getByWalletID: (
    walletID: string,
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ transactions: Transaction[]; total: number }>;
  getByUserID: (
    userID: string,
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ transactions: Transaction[]; total: number }>;
  getByCategory: (
    userID: string,
    category: string,
    offset: number,
    limit: number
  ) => Promise<{ transactions: Transaction[]; total: number }>;
  updateStatus: (
    reference: string,
    status: string,
    completedAt?: Date
  ) => Promise<void>;
  reverse: (reference: string, reversedTxnID: string) => Promise<void>;
  getSummaryByDateRange: (
    userID: string,
    startDate: Date,
    endDate: Date
  ) => Promise<TransactionSummary | null>;
  getAdminSummary: (
    startDate: Date,
    endDate: Date
  ) => Promise<AdminTransactionSummary | null>;
  getDailyVolume: (date: Date) => Promise<number>;
  getPendingTransactions: () => Promise<Transaction[]>;
  markAsFailed: (reference: string, response: string) => Promise<void>;
}

// TransferDetailRepository interface
export interface TransferDetailRepository {
  create: (detail: TransferDetail) => Promise<void>;
  getByTransactionID: (transactionID: string) => Promise<TransferDetail | null>;
  getByRecipientID: (
    recipientID: string,
    offset: number,
    limit: number
  ) => Promise<{ details: TransferDetail[]; total: number }>;
}