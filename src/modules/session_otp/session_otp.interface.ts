import type OTP from "@/shared/database/models/otp.model";
import type Session from "@/shared/database/models/session.model";

export interface SessionRepository {
  create: (session: Session) => Promise<void>;
  update: (session: Session) => Promise<void>;
  getByToken: (token: string) => Promise<Session | null>;
  getByUserID: (userID: string) => Promise<Session[]>;
  invalidate: (sessionID: string) => Promise<void>;
  invalidateAllUserSessions: (userID: string) => Promise<void>;
  cleanupExpired: () => Promise<void>;
  extendSession: (sessionID: string, newExpiry: Date) => Promise<void>;
}

// OTPRepository interface
export interface OTPRepository {
  create: (otp: OTP) => Promise<void>;
  getValidOTP: (
    phoneNumber: string,
    code: string,
    purpose: string
  ) => Promise<OTP | null>;
  markAsUsed: (id: string) => Promise<void>;
  incrementAttempts: (id: string) => Promise<void>;
  invalidateByPhoneNumber: (
    phoneNumber: string,
    purpose: string
  ) => Promise<void>;
  cleanupExpired: () => Promise<void>;
}