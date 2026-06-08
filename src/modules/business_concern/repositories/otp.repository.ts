
import { Op, literal } from "sequelize";
import { OTP } from "@/shared/database/models";

export class OTPRepository {
    async create(otp: Partial<OTP>): Promise<OTP> {
        return await OTP.create(otp);
    }

    async getValidOTP(
        phoneNumber: string,
        code: string,
        purpose: string
    ): Promise<OTP | null> {
        return await OTP.findOne({
            where: {
                phoneNumber,
                code,
                purpose,
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() },
            },
        });
    }

    async markAsUsed(id: string): Promise<void> {
        await OTP.update({ isUsed: true }, { where: { id } });
    }

    async incrementAttempts(id: string): Promise<void> {
        await OTP.update(
            { attempts: literal("attempts + 1") },
            { where: { id } }
        );
    }

    async invalidateByPhoneNumber(phoneNumber: string, purpose: string): Promise<void> {
        await OTP.update(
            { isUsed: true },
            { where: { phoneNumber, purpose, isUsed: false } }
        );
    }

    async cleanupExpired(): Promise<void> {
        await OTP.destroy({
            where: { expiresAt: { [Op.lt]: new Date() } },
        });
    }
}
