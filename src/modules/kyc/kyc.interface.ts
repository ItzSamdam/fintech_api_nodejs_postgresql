import type KYCModel from "@/shared/database/models/kyc.model";

export interface KYCRepository {
  create: (kyc: KYCModel) => Promise<void>;
  update: (kyc: KYCModel) => Promise<void>;
  getByUserID: (userID: string) => Promise<KYCModel | null>;
  getByID: (id: string) => Promise<KYCModel | null>;
  getPending: (
    offset: number,
    limit: number
  ) => Promise<{ kycs: KYCModel[]; total: number }>;
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