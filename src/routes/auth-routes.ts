import { type Application } from "express";
import BaseRoutesConfig from "@/routes/base-routes";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthService } from "@/modules/auth/auth.service";
import { UserRepository } from "@/modules/_common/repositories/user.repository";
import { OTPRepository } from "@/modules/_common/repositories/otp.repository";
import { WalletRepository } from "@/modules/_common/repositories/wallet.repository";
import { SessionRepository } from "@/modules/_common/repositories/session.repository";
import { KYCRepository } from "@/modules/_common/repositories/kyc.repository";
import { SMSService } from "@/modules/_common/registry/termii.client.registry";
import {
  ChangePasswordRequestSchema,
  LoginRequestSchema,
  LogoutRequestSchema,
  RefreshTokenRequestSchema,
  RegisterPhoneRequestSchema,
  ResetPasswordRequestSchema,
  SendOTPRequestSchema,
  UpdateUserRequestSchema,
  VerifyOTPRequestSchema
} from "@/modules/_common/schemas/auth-schema";
import { authenticateUser, validate } from "@/shared/middlewares";

const authService = new AuthService(
    new UserRepository(),
    new KYCRepository(),
    new SessionRepository(),
    new OTPRepository(),
    new WalletRepository(),
    new SMSService()
);
const controller = new AuthController(authService);

class AuthRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "AuthRoutes");
    }

    configureRoutes(): Application {

        this.app.route("/auth/register")
            .post(
                validate(RegisterPhoneRequestSchema),
                controller.register.bind(controller)
            );

        this.app.route("/auth/login")
            .post(
                validate(LoginRequestSchema),
                controller.login.bind(controller)
            );

        this.app.route("/auth/logout")
            .post(
                validate(LogoutRequestSchema),
                controller.logout.bind(controller)
            );

        this.app.route("/auth/refresh-token")
            .post(
                validate(RefreshTokenRequestSchema),
                controller.refreshToken.bind(controller)
            );

        this.app.route("/auth/send-otp")
            .post(
                validate(SendOTPRequestSchema),
                controller.sendOTP.bind(controller)
            );

        this.app.route("/auth/verify-otp")
            .post(
                validate(VerifyOTPRequestSchema),
                controller.verifyOTP.bind(controller)
            );

        this.app.route("/auth/reset-password")
            .post(
                validate(ResetPasswordRequestSchema),
                controller.resetPassword.bind(controller)
            );

        this.app.route("/auth/get-me")
            .get(
                authenticateUser,
                controller.getMe.bind(controller)
            );

        this.app.route("/auth/update-me")
            .post(
                validate(UpdateUserRequestSchema),
                authenticateUser,
                controller.updateMe.bind(controller)
            );

        this.app.route("/auth/change-password")
            .post(
                validate(ChangePasswordRequestSchema),
                authenticateUser,
                controller.changePassword.bind(controller)
            );

        return this.app;
    }
}

export default AuthRoutesConfig;
