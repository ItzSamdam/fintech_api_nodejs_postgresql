import type UserModel from "@/shared/database/models/user.model";

export interface UserRepository {
  create: (user: UserModel) => Promise<void>;
  update: (user: UserModel) => Promise<void>;
  delete: (id: string) => Promise<void>;
  softDelete: (id: string) => Promise<void>;
  getByID: (id: string) => Promise<UserModel | null>;
  getByPhoneNumber: (phoneNumber: string) => Promise<UserModel | null>;
  getByEmail: (email: string) => Promise<UserModel | null>;
  getByBVN: (bvn: string) => Promise<UserModel | null>;
  getByNIN: (nin: string) => Promise<UserModel | null>;
  list: (
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ users: UserModel[]; total: number }>;
  updateTier: (userID: string, tier: number) => Promise<void>;
  updateLastLogin: (userID: string, ip: string) => Promise<void>;
  suspend: (userID: string, reason: string, duration?: number) => Promise<void>;
  unsuspend: (userID: string) => Promise<void>;
  search: (
    query: string,
    offset: number,
    limit: number
  ) => Promise<{ users: UserModel[]; total: number }>;
  countByDateRange: (startDate: Date, endDate: Date) => Promise<number>;
  getActiveUsers: () => Promise<number>;
}