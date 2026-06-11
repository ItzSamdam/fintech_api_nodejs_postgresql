
export interface SavingsGoalResponse {
    id: string;                  // UUID
    name: string;
    targetAmount: number;        // in kobo
    targetAmountNaira: number;   // in naira
    currentAmount: number;       // in kobo
    currentAmountNaira: number;  // in naira
    progressPercent: number;
    interestRate: number;
    durationDays: number;
    startDate: Date;
    targetDate: Date;
    daysRemaining: number;
    isAutoDebit: boolean;
    autoDebitAmount?: number;    // in kobo
    status: string;
    createdAt: Date;
}

export interface SavingsContributionResponse {
    id: string;                  // UUID
    amount: number;              // in kobo
    amountNaira: number;         // in naira
    interestEarned: number;      // in kobo
    contributionDate: Date;
    isAutoDebit: boolean;
}

export interface RoundupStatusResponse {
    isActive: boolean;
    savingsGoalId: string;
    multiplier: number;
    maxDailyAmount: number;      // in kobo
    totalRoundup: number;        // in kobo
    totalRoundupNaira: number;   // in naira
}
