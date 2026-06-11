export interface UserPayload {
    userId: string;
    email: string;
    type: "user";
    expiredAt: Date;
}

export interface PaginatedResult<T> {
    docs: T[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    lastPage: number;
}

export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

export interface AdminPayload {
    id: string;
    email: string;
    type: 'admin';
    expiredAt: Date;
    role: string;
    permissions?: string[];
}

export interface GoogleProfile {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
}

export interface AuthResult {
    token: string;
    user: Omit<UserPayload, 'type' | 'provider' | 'expired_at'>;
    isNewUser: boolean;
}

export type AuthProvider = 'google' | 'local';

export type AuthPayload = UserPayload | AdminPayload;

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
            admin?: AdminPayload;
            token?: string;
            session?: Session;
        }
    }
}