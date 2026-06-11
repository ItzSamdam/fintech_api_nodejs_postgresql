export interface NetworkListResponse {
    networks: Network[];
}

export interface Network {
    code: string;
    name: string;
    logoUrl: string;
    isActive: boolean;
}

export interface DataPlanResponse {
    id: string;
    name: string;
    volume: string;       // e.g., "1GB"
    price: number;        // in kobo
    priceNaira: number;   // in naira
    validity: string;     // e.g., "30 days"
    network: string;
}

export interface AirtimeDenominationResponse {
    amount: number;       // in kobo
    amountNaira: number;  // in naira
}

export interface ProviderResponse {
    id: string;
    name: string;
    code: string;
    category: string;
    isActive: boolean;
}

export interface ProviderListResponse {
    providers: ProviderResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface MeterValidationResponse {
    customerName: string;
    customerAddress: string;
    meterNumber: string;
    meterType: string;
    providerId: string;
    providerName: string;
}

export interface ElectricityPaymentResponse {
    transactionId: string;
    reference: string;
    meterNumber: string;
    customerName: string;
    amount: number;        // in kobo
    amountNaira: number;   // in naira
    token?: string;        // for prepaid
    units?: number;
    status: string;
}

export interface BettingAccountResponse {
    providerId: string;
    providerName: string;
    accountId: string;
    accountName: string;
    isValid: boolean;
    balance?: number;      // in kobo
}

export interface BillHistoryResponse {
    id: string;
    billType: string;
    provider: string;
    amount: number;        // in kobo
    amountNaira: number;
    status: string;
    recipient: string;     // phone number, meter number, or account ID
    createdAt: string;     // ISO date string
}
