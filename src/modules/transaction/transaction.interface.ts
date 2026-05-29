import type TransactionModel from "@/shared/database/models/transaction.model";
import type TransferDetailModel from "@/shared/database/models/transfer-detail.model";

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
  create: (transaction: TransactionModel) => Promise<void>;
  update: (transaction: TransactionModel) => Promise<void>;
  getByID: (id: string) => Promise<TransactionModel | null>;
  getByReference: (reference: string) => Promise<TransactionModel | null>;
  getByWalletID: (
    walletID: string,
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ transactions: TransactionModel[]; total: number }>;
  getByUserID: (
    userID: string,
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ transactions: TransactionModel[]; total: number }>;
  getByCategory: (
    userID: string,
    category: string,
    offset: number,
    limit: number
  ) => Promise<{ transactions: TransactionModel[]; total: number }>;
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
  getPendingTransactions: () => Promise<TransactionModel[]>;
  markAsFailed: (reference: string, response: string) => Promise<void>;
}

// TransferDetailRepository interface
export interface TransferDetailRepository {
  create: (detail: TransferDetailModel) => Promise<void>;
  getByTransactionID: (transactionID: string) => Promise<TransferDetailModel | null>;
  getByRecipientID: (
    recipientID: string,
    offset: number,
    limit: number
  ) => Promise<{ details: TransferDetailModel[]; total: number }>;
}