import { type WalletRepository } from "@/modules/_business/repositories/wallet.repository";
import { type TransactionRepository } from "@/modules/_business/repositories/transaction.repository";
import { type SavingsGoalRepository } from "@/modules/_business/repositories/saving-goal.repository";
import { type SavingContributionRepository } from "@/modules/_business/repositories/saving-contribution.repository";
import { type AutoRoundupRepository } from "@/modules/_business/repositories/auto-roundup.repository";
import { type UserRepository } from "@/modules/_business/repositories/user.repository";
import { type CacheRepository } from "@/modules/_business/redis/cache.repository";
import {
    type SavingsGoalResponse,
    type SavingsContributionResponse,
    type RoundupStatusResponse,
} from "@/modules/_business/interfaces/response/savings";

export class SavingsService {
    constructor(
        private readonly savingsGoalRepo: SavingsGoalRepository,
        private readonly savingsContributionRepo: SavingContributionRepository,
        private readonly roundupRepo: AutoRoundupRepository,
        private readonly walletRepo: WalletRepository,
        private readonly transactionRepo: TransactionRepository,
        private readonly userRepo: UserRepository,
        private readonly cache: CacheRepository
    ) { }

    /** Create a new savings goal */
    async createGoal(userId: string, req: any): Promise<SavingsGoalResponse> {
        const startDate = new Date();
        const targetDate = new Date(startDate.getTime() + req.durationDays * 24 * 60 * 60 * 1000);

        const goal = await this.savingsGoalRepo.create({
            userId,
            name: req.name,
            targetAmount: req.targetAmount,
            currentAmount: 0,
            interestRate: 0,
            durationDays: req.durationDays,
            startDate,
            targetDate,
            isAutoDebit: req.isAutoDebit,
            autoDebitAmount: req.autoDebitAmount,
            autoDebitDay: req.autoDebitDay,
            status: "active",
            createdAt: startDate,
        });

        return this.mapGoalToResponse(goal);
    }

    /** Contribute to a savings goal */
    async contributeToGoal(userId: string, req: any): Promise<SavingsContributionResponse> {
        const goal = await this.savingsGoalRepo.getByID(req.goalId as string);
        if (!goal) throw new Error("Goal not found");
        if (goal.userId !== userId) throw new Error("Unauthorized");
        if (goal.status !== "active") throw new Error("Goal is not active");
        if (goal.currentAmount >= goal.targetAmount) throw new Error("Goal already completed");

        const wallet = await this.walletRepo.getByUserIdForUpdate(userId);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.balance < req.amount) throw new Error("Insufficient balance");

        const reference = this.generateReference("SAV");

        // Debit wallet
        await this.walletRepo.debit(wallet.id, req.amount as number);

        // Create transaction
        const transaction = await this.transactionRepo.create({
            reference,
            walletId: wallet.id,
            userId,
            type: "debit",
            category: "savings",
            amount: req.amount,
            fee: 0,
            vat: 0,
            totalAmount: req.amount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - req.amount,
            status: "success",
            description: `Contribution to savings goal: ${goal.name}`,
            createdAt: new Date(),
            completedAt: new Date(),
        });

        // Create contribution
        const contribution = await this.savingsContributionRepo.create({
            savingsGoalId: goal.id,
            transactionId: transaction.id,
            amount: req.amount,
            interestEarned: 0,
            contributionDate: new Date(),
            isAutoDebit: false,
        });

        // Update goal current amount
        await this.savingsGoalRepo.updateCurrentAmount(goal.id, goal.currentAmount + req.amount as number);

        return {
            id: contribution.id,
            amount: contribution.amount,
            amountNaira: contribution.amount / 100,
            interestEarned: contribution.interestEarned,
            contributionDate: contribution.contributionDate,
            isAutoDebit: contribution.isAutoDebit,
        };
    }

    /** Get all goals for a user */
    async getGoals(userId: string): Promise<SavingsGoalResponse[]> {
        const goals = await this.savingsGoalRepo.getByUserID(userId);
        return goals.map((g: any) => this.mapGoalToResponse(g));
    }

    /** Get a single goal */
    async getGoal(userId: string, goalId: string): Promise<SavingsGoalResponse> {
        const goal = await this.savingsGoalRepo.getByID(goalId);
        if (!goal) throw new Error("Goal not found");
        if (goal.userId !== userId) throw new Error("Unauthorized");
        return this.mapGoalToResponse(goal);
    }

    /** Update a goal */
    async updateGoal(userId: string, goalId: string, req: any): Promise<void> {
        const goal = await this.savingsGoalRepo.getByID(goalId);
        if (!goal) throw new Error("Goal not found");
        if (goal.userId !== userId) throw new Error("Unauthorized");

        if (req.name) goal.name = req.name;
        if (req.isAutoDebit !== undefined) {
            goal.isAutoDebit = req.isAutoDebit;
            goal.autoDebitAmount = req.autoDebitAmount;
            goal.autoDebitDay = req.autoDebitDay;
        }

        await this.savingsGoalRepo.update(goal);
    }

    /** Delete a goal */
    async deleteGoal(userId: string, goalId: string): Promise<void> {
        const goal = await this.savingsGoalRepo.getByID(goalId);
        if (!goal) throw new Error("Goal not found");
        if (goal.userId !== userId) throw new Error("Unauthorized");

        if (goal.currentAmount > 0) {
            // TODO: implement withdrawal back to wallet
        }

        await this.savingsGoalRepo.delete(goalId);
    }

    /** Activate roundup */
    async activateRoundup(userId: string, req: any): Promise<void> {
        const goal = await this.savingsGoalRepo.getByID(req.goalId as string);
        if (!goal) throw new Error("Goal not found");
        if (goal.userId !== userId) throw new Error("Unauthorized");

        const existing = await this.roundupRepo.getByUserID(userId);
        if (existing) {
            existing.savingsGoalId = goal.id;
            existing.isActive = true;
            existing.multiplier = req.multiplier;
            existing.maxDailyAmount = req.maxDailyAmount;
            await this.roundupRepo.update(existing);
        } else {
            await this.roundupRepo.create({
                userId,
                savingsGoalId: goal.id,
                isActive: true,
                multiplier: req.multiplier,
                maxDailyAmount: req.maxDailyAmount,
                totalRoundup: 0,
            });
        }
    }

    async deactivateRoundup(userId: string): Promise<void> {
        await this.roundupRepo.deactivate(userId);
    }

    async getRoundupStatus(userId: string): Promise<RoundupStatusResponse> {
        const roundup = await this.roundupRepo.getByUserID(userId);
        if (!roundup) return { isActive: false, savingsGoalId: "", multiplier: 0, maxDailyAmount: 0, totalRoundup: 0, totalRoundupNaira: 0 };

        return {
            isActive: roundup.isActive,
            savingsGoalId: roundup.savingsGoalId,
            multiplier: roundup.multiplier,
            maxDailyAmount: roundup.maxDailyAmount,
            totalRoundup: roundup.totalRoundup,
            totalRoundupNaira: roundup.totalRoundup / 100,
        };
    }

    /** Helpers */
    private mapGoalToResponse(goal: any): SavingsGoalResponse {
        const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
        const daysRemaining = Math.max(Math.floor((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0);

        return {
            id: goal.id,
            name: goal.name,
            targetAmount: goal.targetAmount,
            targetAmountNaira: goal.targetAmount / 100,
            currentAmount: goal.currentAmount,
            currentAmountNaira: goal.currentAmount / 100,
            progressPercent,
            interestRate: goal.interestRate,
            durationDays: goal.durationDays,
            startDate: goal.startDate,
            targetDate: goal.targetDate,
            daysRemaining,
            isAutoDebit: goal.isAutoDebit,
            autoDebitAmount: goal.autoDebitAmount,
            status: goal.status,
            createdAt: goal.createdAt,
        };
    }

    private generateReference(prefix: string): string {
        return `${prefix}${Date.now()}`;
    }
}
