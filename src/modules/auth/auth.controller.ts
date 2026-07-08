import { type Request, type Response, type NextFunction } from "express";
import { type AuthService } from "@/modules/auth/auth.service";
import { getUserIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";

export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.authService.registerPhone(req.body.phoneNumber as string);
            res.json({ success: true, message: "OTP sent successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async sendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.authService.sendOTP(req.body.phoneNumber as string, req.body.purpose as string);
            res.json({ success: true, message: "OTP sent successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.authService.verifyOTP(req.body.phoneNumber as string, req.body.code as string, req.body.deviceId as string, req.body.deviceName as string);
            res.json({ success: true, message: "OTP verified successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    // async registerBVN(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const userId = getUserIdFromRequest(req);
    //         await this.authService.registerBVN(userId, req.body);
    //         res.json({ success: true, message: "BVN verified successfully. Tier upgraded." });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // async verifyFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const userId = getUserIdFromRequest(req);
    //         await this.authService.verifyFace(userId, req.body);
    //         res.json({ success: true, message: "Face verified successfully. Tier upgraded." });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.authService.login(req.body.phoneNumber as string, req.body.password as string, req.body.deviceId as string);
            res.json({ success: true, message: "Login successful", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.authService.getUserProfile(userId);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            await this.authService.updateUserProfile(userId, req.body);
            res.json({ success: true, message: "Profile updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            await this.authService.changePassword(userId, req.body.oldPassword as string, req.body.newPassword as string);
            res.json({ success: true, message: "Password changed successfully" });
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.authService.resetPassword(req.body.phoneNumber as string, req.body.code as string, req.body.password as string);
            res.json({ success: true, message: "Password reset successfully" });
        } catch (err) {
            next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            let token = req.headers.authorization ?? "";
            if (token.startsWith("Bearer ")) {
                token = token.slice(7);
            }
            const { allDevices } = req.body as { allDevices: boolean };
            await this.authService.logout(userId, token, allDevices);
            res.json({ success: true, message: "Logged out successfully" });
        } catch (err) {
            next(err);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const resp = await this.authService.refreshToken(refreshToken as string);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }
}
