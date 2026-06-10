export interface BalanceResponse {
    balance: number;         // In kobo
    balanceNaira: number;    // In naira
    currency: string;
    isLocked: boolean;
}

export interface TierLimits {
    dailyLimit: number;      // In kobo
    weeklyLimit: number;     // In kobo
    monthlyLimit: number;    // In kobo
    singleTxLimit: number;   // In kobo
}

export interface WalletResponse {
    id: string;              // UUID
    userId: string;          // UUID
    balance: number;         // In kobo
    balanceNaira: number;    // In naira
    currency: string;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionResponse {
    id: string;              // UUID
    reference: string;
    type: string;
    category: string;
    subCategory?: string;
    amount: number;          // In kobo
    amountNaira: number;     // In naira
    fee: number;             // In kobo
    feeNaira: number;        // In naira
    totalAmount: number;     // In kobo
    totalAmountNaira: number;// In naira
    status: string;
    description: string;
    balanceBefore: number;
    balanceAfter: number;
    completedAt?: Date;
    createdAt: Date;

    transferDetail?: TransferDetailResponse;
    billDetail?: BillDetailResponse;
}

export interface TransferDetailResponse {
    recipientType: string;
    recipientId: string;
    recipientName: string;
    recipientBank?: string;
    narration: string;
}

export interface BillDetailResponse {
    billType: string;
    providerName: string;
    phoneNumber?: string;
    meterNumber?: string;
    customerName: string;
    electricityToken?: string;
    dataPlanName?: string;
    dataVolume?: string;
}

export interface TransactionHistoryResponse {
    transactions: TransactionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
