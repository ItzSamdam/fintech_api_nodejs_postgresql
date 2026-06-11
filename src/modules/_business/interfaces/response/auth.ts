export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;   // seconds
    tokenType: string;
    user: UserResponse;
}

export interface UserListResponse {
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserResponse {
    id: string;          // UUID
    phoneNumber: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    tier: number;
    isActive: boolean;
    isSuspended: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TierLimitResponse {
    tier: number;
    dailyLimit: number;       // in kobo
    weeklyLimit: number;      // in kobo
    monthlyLimit: number;     // in kobo
    singleTxLimit: number;    // in kobo
    dailySpent: number;       // in kobo
    weeklySpent: number;      // in kobo
    monthlySpent: number;     // in kobo
    dailyRemaining: number;
    weeklyRemaining: number;
    monthlyRemaining: number;
}

export interface KYCStatusResponse {
    bvnVerified: boolean;
    ninVerified: boolean;
    faceVerified: boolean;
    status: string;
    verifiedAt?: Date;
}

// Session Management
export interface SessionResponse {
    id: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    location?: string;
    isCurrent: boolean;
    lastActiveAt: Date;
    createdAt: Date;
    expiresAt: Date;
}

// 2FA
export interface TwoFASetupResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

export interface TwoFAVerifyResponse {
    isVerified: boolean;
    message: string;
}

// Device Management
export interface DeviceTrustResponse {
    deviceId: string;
    deviceName: string;
    isTrusted: boolean;
    message: string;
}

// SIM Swap
export interface SIMSwapResponse {
    isSwapped: boolean;
    swappedAt?: Date;
    previousSim?: string;
    currentSim?: string;
    message: string;
}

// Limit Check
export interface LimitCheckResponse {
    isAllowed: boolean;
    currentAmount: number;
    limitAmount: number;
    limitType: string;   // daily, weekly, monthly, single
    remaining: number;
    resetsAt?: string;
}

// Suspicious Report
export interface SuspiciousReportResponse {
    reportId: string;
    status: string;
    message: string;
    reference: string;
}

// Password Reset
export interface PasswordResetResponse {
    message: string;
    reference: string;
    expiresIn: number;   // seconds
}

// Logout
export interface LogoutResponse {
    message: string;
    success: boolean;
}
