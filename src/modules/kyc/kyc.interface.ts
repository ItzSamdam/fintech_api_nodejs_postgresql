import type KYC from "@/shared/database/models/kyc.model";

export interface KYCRepository {
  create: (kyc: KYC) => Promise<void>;
  update: (kyc: KYC) => Promise<void>;
  getByUserID: (userID: string) => Promise<KYC | null>;
  getByID: (id: string) => Promise<KYC | null>;
  getPending: (
    offset: number,
    limit: number
  ) => Promise<{ kycs: KYC[]; total: number }>;
  approve: (id: string, approvedBy: string) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
  updateBVNVerification: (userID: string, verified: boolean) => Promise<void>;
  updateNINVerification: (userID: string, verified: boolean) => Promise<void>;
  updateFaceVerification: (
    userID: string,
    verified: boolean,
    score: number
  ) => Promise<void>;
}