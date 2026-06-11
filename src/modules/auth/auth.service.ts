import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { type SMSService } from "@/modules/_common/registry/termii.client.registry";
import { type UserRepository } from "@/modules/_common/repositories/user.repository";
import { type KYCRepository } from "@/modules/_common/repositories/kyc.repository";
import { type SessionRepository } from "@/modules/_common/repositories/session.repository";
import { type OTPRepository } from "@/modules/_common/repositories/otp.repository";
import { type WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { config } from "@/shared/config/dev";

export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly kycRepo: KYCRepository,
        private readonly sessionRepo: SessionRepository,
        private readonly otpRepo: OTPRepository,
        private readonly walletRepo: WalletRepository,
        private readonly smsService: SMSService
    ) { }

    async registerPhone(phoneNumber: string): Promise<{ reference: string; expiresIn: number }> {
        const existingUser = await this.userRepo.getByPhoneNumber(phoneNumber);

        if (existingUser && existingUser.isActive) {
            throw new Error("User already exists with this phone number");
        }

        if (!existingUser) {
            await this.userRepo.create({
                phoneNumber,
                isActive: false,
                tier: 0,
            });
        }

        return await this.sendOTP(phoneNumber, "registration");
    }

    async sendOTP(phoneNumber: string, purpose: string): Promise<{ reference: string; expiresIn: number }> {
        await this.otpRepo.invalidateByPhoneNumber(phoneNumber, purpose);

        const otpCode = this.generateOTP();

        const otp = await this.otpRepo.create({
            phoneNumber,
            code: otpCode,
            purpose,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        if (this.smsService) {
            this.smsService.sendAsync(phoneNumber, otpCode, "", 10);
        }

        return { reference: otp.id, expiresIn: 600 };
    }

    async verifyOTP(phoneNumber: string, code: string, deviceId: string, deviceName: string): Promise<any> {
        const otp = await this.otpRepo.getValidOTP(phoneNumber, code, "registration");
        if (!otp) throw new Error("Invalid or expired OTP");

        await this.otpRepo.markAsUsed(otp.id);

        const user = await this.userRepo.create({
            phoneNumber,
            isActive: true,
            tier: 0,
            deviceId,
        });

        await this.kycRepo.create({ userId: user.id, status: "pending" });
        await this.walletRepo.create({ userId: user.id, balance: 0, currency: "NGN" });

        const { accessToken, refreshToken } = await this.createUserSession(user, deviceId, deviceName, phoneNumber);

        return {
            accessToken,
            refreshToken,
            expiresIn: config.jwt.expiresIn,
            tokenType: "Bearer",
            user,
        };
    }

    // TODO: Implement email registration and verification flow, kyc verification flow (NIN, BVN, Face/Document verification)


    async login(phoneNumber: string, password: string, deviceId: string): Promise<any> {
        const user = await this.userRepo.getByPhoneNumber(phoneNumber);
        if (!user) throw new Error("Invalid credentials");

        if (user.passwordHash) {
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) throw new Error("Invalid credentials");
        }

        if (user.isSuspended) throw new Error("Account is suspended");

        await this.userRepo.updateLastLogin(user.id, phoneNumber);

        const { accessToken, refreshToken } = await this.createUserSession(user, deviceId, "", phoneNumber);

        return {
            accessToken,
            refreshToken,
            expiresIn: config.jwt.expiresIn,
            tokenType: "Bearer",
            user,
        };
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepo.getById(userId);
        if (!user) throw new Error("User not found");

        if (user.passwordHash) {
            const valid = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!valid) throw new Error("Invalid old password");
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepo.update(user);
    }

    async resetPassword(phoneNumber: string, code: string, newPassword: string): Promise<void> {
        const otp = await this.otpRepo.getValidOTP(phoneNumber, code, "reset_password");
        if (!otp) throw new Error("Invalid or expired OTP");

        await this.otpRepo.markAsUsed(otp.id);

        const user = await this.userRepo.getByPhoneNumber(phoneNumber);
        if (!user) throw new Error("User not found");

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await this.sessionRepo.invalidateAllUserSessions(user.id);
        await this.userRepo.update(user);
    }

    async logout(userId: string, token: string, allDevices: boolean): Promise<void> {
        if (allDevices) {
            await this.sessionRepo.invalidateAllUserSessions(userId);
        } else {
            const session = await this.sessionRepo.getByToken(token);
            if (session) await this.sessionRepo.invalidate(session.id);
        }
    }

    async refreshToken(refreshToken: string): Promise<any> {
        const decoded: any = jwt.verify(refreshToken, config.jwt.secret);
        if (decoded.token_type !== "refresh") throw new Error("Invalid token type");

        const user = await this.userRepo.getById(decoded.user_id as string);
        if (!user) throw new Error("User not found");

        const { accessToken, refreshToken: newRefreshToken } = await this.createUserSession(user, "", "", "");

        return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: config.jwt.expiresIn,
            tokenType: "Bearer",
            user,
        };
    }

    private async createUserSession(user: any, deviceId: string, deviceName: string, ipAddress: string): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = this.generateToken(user, "access");
        const refreshToken = this.generateToken(user, "refresh");

        await this.sessionRepo.create({
            id: uuidv4(),
            userId: user.id,
            token: accessToken,
            refreshToken,
            ipAddress,
            deviceName,
            isActive: true,
            expiresAt: new Date(Date.now() + Number(config.jwt.expiresIn) * 1000),
            lastActiveAt: new Date(),
        });

        return { accessToken, refreshToken };
    }

    private generateToken(user: any, tokenType: "access" | "refresh"): string {
        const expiry = tokenType === "access" ? config.jwt.expiresIn : config.jwt.refreshTokenExpiresIn;

        const payload = {
            user_id: user.id,
            phone: user.phoneNumber,
            email: user.email,
            tier: user.tier,
            token_type: tokenType,
        };

        const options: SignOptions = {
            expiresIn: Number(expiry), // can be number (seconds) or string ("10m")
            issuer: "prod",    // or config.jwt.issuer if you want dynamic
        };

        return jwt.sign(payload, config.jwt.secret, options);
    }

    private generateOTP(): string {
        const n = Math.floor(Math.random() * 1000000);
        return n.toString().padStart(6, "0");
    }
}
