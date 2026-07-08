import { z } from 'zod';

// Register Phone Request
export const RegisterPhoneRequestSchema = z.object({
    phone_number: z.string()
        .length(11, 'Phone number must be exactly 11 characters')
        .regex(/^\d+$/, 'Phone number must contain only numbers'),
});

export type RegisterPhoneRequest = z.infer<typeof RegisterPhoneRequestSchema>;

// Send OTP Request
export const SendOTPRequestSchema = z.object({
    phone_number: z.string()
        .length(11, 'Phone number must be exactly 11 characters')
        .regex(/^\d+$/, 'Phone number must contain only numbers'),
    purpose: z.string().min(1, 'Purpose is required'),
});

export type SendOTPRequest = z.infer<typeof SendOTPRequestSchema>;

// Verify OTP Request
export const VerifyOTPRequestSchema = z.object({
    phone_number: z.string()
        .length(11, 'Phone number must be exactly 11 characters')
        .regex(/^\d+$/, 'Phone number must contain only numbers'),
    code: z.string()
        .length(6, 'Code must be exactly 6 characters')
        .regex(/^\d+$/, 'Code must contain only numbers'),
    device_id: z.string().min(1, 'Device ID is required'),
    device_name: z.string().optional(),
});

export type VerifyOTPRequest = z.infer<typeof VerifyOTPRequestSchema>;

// Register BVN Request
export const RegisterBVNRequestSchema = z.object({
    bvn: z.string()
        .length(11, 'BVN must be exactly 11 characters')
        .regex(/^\d+$/, 'BVN must contain only numbers'),
    nin: z.string()
        .length(11, 'NIN must be exactly 11 characters')
        .regex(/^\d+$/, 'NIN must contain only numbers'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    middle_name: z.string().optional(),
});

export type RegisterBVNRequest = z.infer<typeof RegisterBVNRequestSchema>;

// Verify Face Request
export const VerifyFaceRequestSchema = z.object({
    face_photo: z.string().min(1, 'Face photo is required'),
    liveness_video: z.string().optional(),
});

export type VerifyFaceRequest = z.infer<typeof VerifyFaceRequestSchema>;

// Login Request
export const LoginRequestSchema = z.object({
    phone_number: z.string()
        .length(11, 'Phone number must be exactly 11 characters')
        .regex(/^\d+$/, 'Phone number must contain only numbers'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
    device_id: z.string().min(1, 'Device ID is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Change Password Request
export const ChangePasswordRequestSchema = z.object({
    old_password: z.string().min(1, 'Old password is required'),
    new_password: z.string()
        .min(6, 'New password must be at least 6 characters'),
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Reset Password Request
export const ResetPasswordRequestSchema = z.object({
    phone_number: z.string()
        .length(11, 'Phone number must be exactly 11 characters')
        .regex(/^\d+$/, 'Phone number must contain only numbers'),
    code: z.string()
        .length(6, 'Code must be exactly 6 characters')
        .regex(/^\d+$/, 'Code must contain only numbers'),
    new_password: z.string()
        .min(6, 'New password must be at least 6 characters'),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Update User Request
export const UpdateUserRequestSchema = z.object({
    email: z.string().email('Invalid email format').optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    address: z.string().optional(),
    date_of_birth: z.string().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

// Refresh Token Request
export const RefreshTokenRequestSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Logout Request
export const LogoutRequestSchema = z.object({
    all_devices: z.boolean().optional().default(false),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;