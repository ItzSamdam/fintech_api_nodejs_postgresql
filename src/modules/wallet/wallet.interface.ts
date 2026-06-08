import type Wallet from "@/shared/database/models/wallet.model";

export interface WalletRepository {
  create: (wallet: Wallet) => Promise<void>;
  update: (wallet: Wallet) => Promise<void>;
  getByID: (id: string) => Promise<Wallet | null>;
  getByUserID: (userID: string) => Promise<Wallet | null>;
  getByUserIDForUpdate: (userID: string) => Promise<Wallet | null>;
  debit: (walletID: string, amount: number, reference: string) => Promise<void>;
  credit: (walletID: string, amount: number, reference: string) => Promise<void>;
  lock: (walletID: string, reason: string) => Promise<void>;
  unlock: (walletID: string) => Promise<void>;
  updateSpentLimits: (walletID: string, amount: number) => Promise<void>;
  resetDailySpent: () => Promise<void>;
  resetWeeklySpent: () => Promise<void>;
  resetMonthlySpent: () => Promise<void>;
  getTotalBalance: () => Promise<number>;
  list: (
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ wallets: Wallet[]; total: number }>;
}