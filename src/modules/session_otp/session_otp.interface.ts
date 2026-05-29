import type OTPModel from "@/shared/database/models/otp.model";
import type SessionModel from "@/shared/database/models/session.model";

export interface SessionRepository {
  create: (session: SessionModel) => Promise<void>;
  update: (session: SessionModel) => Promise<void>;
  getByToken: (token: string) => Promise<SessionModel | null>;
  getByUserID: (userID: string) => Promise<SessionModel[]>;
  invalidate: (sessionID: string) => Promise<void>;
  invalidateAllUserSessions: (userID: string) => Promise<void>;
  cleanupExpired: () => Promise<void>;
  extendSession: (sessionID: string, newExpiry: Date) => Promise<void>;
}

// OTPRepository interface
export interface OTPRepository {
  create: (otp: OTPModel) => Promise<void>;
  getValidOTP: (
    phoneNumber: string,
    code: string,
    purpose: string
  ) => Promise<OTPModel | null>;
  markAsUsed: (id: string) => Promise<void>;
  incrementAttempts: (id: string) => Promise<void>;
  invalidateByPhoneNumber: (
    phoneNumber: string,
    purpose: string
  ) => Promise<void>;
  cleanupExpired: () => Promise<void>;
}