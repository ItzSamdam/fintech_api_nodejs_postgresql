import { KYC, User } from "@/shared/database/models";

export class KYCRepository {
    async create(kyc: Partial<KYC>): Promise<KYC> {
        return await KYC.create(kyc);
    }

    async update(kyc: KYC): Promise<KYC> {
        await kyc.save();
        return kyc;
    }

    async getByUserID(userID: string): Promise<KYC | null> {
        return await KYC.findOne({ where: { userId: userID } });
    }

    async getByID(id: string): Promise<KYC | null> {
        return await KYC.findOne({ where: { id } });
    }

    async getPending(offset: number, limit: number): Promise<{ kycList: KYC[]; total: number }> {
        const where = { status: "pending" };
        const total = await KYC.count({ where });
        const kycList = await KYC.findAll({
            where,
            offset,
            limit,
            include: [User],
            order: [["createdAt", "ASC"]],
        });
        return { kycList, total };
    }

    async approve(id: string, approvedBy: string): Promise<void> {
        await KYC.update(
            { status: "approved", approvedBy, approvedAt: new Date() },
            { where: { id } }
        );
    }

    async reject(id: string, reason: string): Promise<void> {
        await KYC.update(
            { status: "rejected", rejectionReason: reason },
            { where: { id } }
        );
    }

    async updateBVNVerification(userID: string, verified: boolean): Promise<void> {
        const updates: Record<string, unknown> = { bvnVerified: verified };
        if (verified) updates.bvnVerifiedAt = new Date();
        await KYC.update(updates, { where: { userId: userID } });
    }

    async updateNINVerification(userID: string, verified: boolean): Promise<void> {
        const updates: Record<string, unknown> = { ninVerified: verified };
        if (verified) updates.ninVerifiedAt = new Date();
        await KYC.update(updates, { where: { userId: userID } });
    }

    async updateFaceVerification(userID: string, verified: boolean, score: number): Promise<void> {
        await KYC.update(
            { faceVerified: verified, faceVerifiedAt: new Date(), livenessScore: score },
            { where: { userId: userID } }
        );
    }
}
