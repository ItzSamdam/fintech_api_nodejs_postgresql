import { Op, type Transaction, literal } from 'sequelize';
import { Wallet } from '@/shared/database/models';

export class WalletRepository {
    async create(wallet: Partial<Wallet>, transaction?: Transaction): Promise<Wallet> {
        return await Wallet.create(wallet, { transaction });
    }

    async update(wallet: Wallet, transaction?: Transaction): Promise<Wallet> {
        await wallet.save({ transaction });
        return wallet;
    }

    async getById(id: string): Promise<Wallet | null> {
        return await Wallet.findOne({ where: { id } });
    }

    async getByUserId(userId: string): Promise<Wallet | null> {
        return await Wallet.findOne({ where: { userId } });
    }

    async getByUserIdForUpdate(userId: string, transaction?: Transaction): Promise<Wallet | null> {
        return await Wallet.findOne({
            where: { userId },
            lock: transaction ? transaction.LOCK.UPDATE : undefined,
            transaction,
        });
    }

    async debit(walletId: string, amount: number): Promise<void> {
        await Wallet.update(
            { balance: literal(`balance - ${amount}`) },
            { where: { id: walletId, balance: { [Op.gte]: amount } } }
        );
    }

    async credit(walletId: string, amount: number): Promise<void> {
        await Wallet.update(
            { balance: literal(`balance + ${amount}`) },
            { where: { id: walletId } }
        );
    }

    async lock(walletId: string, reason: string): Promise<void> {
        await Wallet.update(
            {
                isLocked: true,
                lockedAt: new Date(),
                lockReason: reason,
            },
            { where: { id: walletId } }
        );
    }

    async unlock(walletId: string): Promise<void> {
        await Wallet.update(
            {
                isLocked: false,
                lockedAt: null,
                lockReason: null,
            },
            { where: { id: walletId } }
        );
    }

    async updateSpentLimits(walletId: string, amount: number): Promise<void> {
        await Wallet.update(
            {
                dailySpent: literal(`daily_spent + ${amount}`),
                weeklySpent: literal(`weekly_spent + ${amount}`),
                monthlySpent: literal(`monthly_spent + ${amount}`),
            },
            { where: { id: walletId } }
        );
    }

    async resetDailySpent(): Promise<void> {
        const now = new Date();
        await Wallet.update(
            { dailySpent: 0, lastDailyReset: now },
            { where: { lastDailyReset: { [Op.lt]: now.setHours(0, 0, 0, 0) } } }
        );
    }

    async resetWeeklySpent(): Promise<void> {
        const now = new Date();
        const day = now.getDay() === 0 ? 7 : now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (day - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        await Wallet.update(
            { weeklySpent: 0, lastWeeklyReset: now },
            { where: { lastWeeklyReset: { [Op.lt]: startOfWeek } } }
        );
    }

    async resetMonthlySpent(): Promise<void> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        await Wallet.update(
            { monthlySpent: 0, lastMonthlyReset: now },
            { where: { lastMonthlyReset: { [Op.lt]: startOfMonth } } }
        );
    }

    async getTotalBalance(): Promise<number> {
        const result = await Wallet.findOne({
            attributes: [[literal('COALESCE(SUM(balance), 0)'), 'total']],
        });
        return Number(result?.getDataValue('total') || 0);
    }

    async list(
        offset: number,
        limit: number,
        filters: Record<string, any>
    ): Promise<{ wallets: Wallet[]; total: number }> {
        const where: any = {};
        if (filters.is_locked !== undefined) where.isLocked = filters.is_locked;
        if (filters.currency) where.currency = filters.currency;

        const total = await Wallet.count({ where });
        const wallets = await Wallet.findAll({
            where,
            offset,
            limit,
            include: ['User'], // preload User association
        });

        return { wallets, total };
    }
}
