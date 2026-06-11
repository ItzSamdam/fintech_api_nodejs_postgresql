
export interface ErrorResponse {
    error: string;
    message: string;
    code?: string;
    details?: Record<string, string>;
}

export interface ValidationErrorResponse {
    error: string;
    message: string;
    errors: Record<string, string>;
}

export interface PaginatedResponse<T> {
    data: T;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}


export interface RevenueReportResponse {
    period: string; // e.g., "2024-06-01" for daily, "2024-06" for monthly
    totalRevenue: number; // in kobo
    revenueByBillType: Record<string, number>; // e.g., { airtime: 100000, data: 50000 }
    feeBreakdown: Record<string, number>; // e.g., { airtime: 1000, data: 500 }
}



export interface SystemSettings {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    globalDailyLimit: number; // in kobo
    globalSingleTxLimit: number; // in kobo
    maxRetryCount: number;
    sessionTimeout: number; // in seconds
}

export interface AuditLogResponse {
    logs: Logs[];
    total: number;
}

export interface Logs {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    ipAddress ?: string;
    createdAt: Date;
}