import { type UserModel } from "@/shared/database/models/";

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
  updateTier: (userId: string, tier: number) => Promise<void>;
  updateLastLogin: (userId: string, ip: string) => Promise<void>;
  suspend: (userId: string, reason: string, duration?: number) => Promise<void>;
  unsuspend: (userId: string) => Promise<void>;
  search: (
    query: string,
    offset: number,
    limit: number
  ) => Promise<{ users: UserModel[]; total: number }>;
  countByDateRange: (startDate: Date, endDate: Date) => Promise<number>;
  getActiveUsers: () => Promise<number>;
}