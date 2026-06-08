import type User from "@/shared/database/models/user.model";

export interface UserRepository {
  create: (user: User) => Promise<void>;
  update: (user: User) => Promise<void>;
  delete: (id: string) => Promise<void>;
  softDelete: (id: string) => Promise<void>;
  getByID: (id: string) => Promise<User | null>;
  getByPhoneNumber: (phoneNumber: string) => Promise<User | null>;
  getByEmail: (email: string) => Promise<User | null>;
  getByBVN: (bvn: string) => Promise<User | null>;
  getByNIN: (nin: string) => Promise<User | null>;
  list: (
    offset: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ users: User[]; total: number }>;
  updateTier: (userID: string, tier: number) => Promise<void>;
  updateLastLogin: (userID: string, ip: string) => Promise<void>;
  suspend: (userID: string, reason: string, duration?: number) => Promise<void>;
  unsuspend: (userID: string) => Promise<void>;
  search: (
    query: string,
    offset: number,
    limit: number
  ) => Promise<{ users: User[]; total: number }>;
  countByDateRange: (startDate: Date, endDate: Date) => Promise<number>;
  getActiveUsers: () => Promise<number>;
}