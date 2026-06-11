import { Op, literal } from "sequelize";
import { Transaction, TransferDetail, BillDetail } from "@/shared/database/models";

export class TransactionRepository {
    async create(transaction: Partial<Transaction>): Promise<Transaction> {
        return await Transaction.create(transaction);
    }

    async update(transaction: Transaction): Promise<Transaction> {
        await transaction.save();
        return transaction;
    }

    async getByID(id: string): Promise<Transaction | null> {
        return await Transaction.findOne({
            where: { id },
            include: [TransferDetail, BillDetail],
        });
    }

    async getByReference(reference: string): Promise<Transaction | null> {
        return await Transaction.findOne({
            where: { reference },
            include: [TransferDetail, BillDetail],
        });
    }

    async getByWalletID(
        walletID: string,
        offset: number,
        limit: number,
        filters: Record<string, any>
    ): Promise<{ transactions: Transaction[]; total: number }> {
        const where: any = { walletId: walletID };
        if (filters.category) where.category = filters.category;
        if (filters.status) where.status = filters.status;
        if (filters.from_date) where.createdAt = { [Op.gte]: filters.from_date };
        if (filters.to_date)
            where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.to_date };

        const total = await Transaction.count({ where });
        const transactions = await Transaction.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [TransferDetail, BillDetail],
        });

        return { transactions, total };
    }

    async getByUserID(
        userID: string,
        offset: number,
        limit: number,
        filters: Record<string, any>
    ): Promise<{ transactions: Transaction[]; total: number }> {
        const where: any = { userId: userID };
        if (filters.category) where.category = filters.category;
        if (filters.status) where.status = filters.status;
        if (filters.from_date) where.createdAt = { [Op.gte]: filters.from_date };
        if (filters.to_date)
            where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.to_date };

        const total = await Transaction.count({ where });
        const transactions = await Transaction.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [TransferDetail, BillDetail],
        });

        return { transactions, total };
    }

    async getByCategory(
        userID: string,
        category: string,
        offset: number,
        limit: number
    ): Promise<{ transactions: Transaction[]; total: number }> {
        const where = { userId: userID, category };
        const total = await Transaction.count({ where });
        const transactions = await Transaction.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        return { transactions, total };
    }

    async updateStatus(reference: string, status: string, completedAt?: Date): Promise<void> {
        const updates: Partial<Transaction> = { status };
        if (completedAt) updates.completedAt = completedAt;
        await Transaction.update(updates, { where: { reference } });
    }

    async reverse(reference: string, reversedTxnID: string): Promise<void> {
        await Transaction.update(
            {
                isReversed: true,
                reversedTxnId: reversedTxnID,
                status: "reversed",
            },
            { where: { reference } }
        );
    }

    async getSummaryByDateRange(
        userID: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        const summary = await Transaction.findOne({
            where: {
                userId: userID,
                createdAt: { [Op.between]: [startDate, endDate] },
                status: "success",
            },
            attributes: [
                [literal("COUNT(*)"), "totalCount"],
                [literal("COALESCE(SUM(amount), 0)"), "totalAmount"],
                [literal("COALESCE(SUM(fee), 0)"), "totalFee"],
                [literal("COALESCE(SUM(vat), 0)"), "totalVat"],
            ],
            raw: true,
        });

        // Counts by status
        const statusCounts = await Transaction.findAll({
            where: {
                userId: userID,
                createdAt: { [Op.between]: [startDate, endDate] },
            },
            attributes: ["status", [literal("COUNT(*)"), "count"]],
            group: ["status"],
            raw: true,
        });

        return { ...summary, statusCounts };
    }

    async getAdminSummary(startDate: Date, endDate: Date): Promise<any> {
        return await Transaction.findOne({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
                status: "success",
            },
            attributes: [
                [literal("COALESCE(SUM(total_amount), 0)"), "totalVolume"],
                [literal("COALESCE(SUM(fee + vat), 0)"), "totalRevenue"],
            ],
            raw: true,
        });
    }

    async getDailyVolume(date: Date): Promise<number> {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        const result = (await Transaction.findOne({
            where: {
                createdAt: { [Op.between]: [startOfDay, endOfDay] },
                status: "success",
            },
            attributes: [[literal("COALESCE(SUM(amount), 0)"), "volume"]],
            raw: true,
        })) as { volume?: number } | null;

        return Number(result?.volume ?? 0);
    }

    async getPendingTransactions(): Promise<Transaction[]> {
        const cutoff = new Date(Date.now() - 5 * 60 * 1000);
        return await Transaction.findAll({
            where: { status: "pending", createdAt: { [Op.lt]: cutoff } },
        });
    }

    async markAsFailed(reference: string, response: string): Promise<void> {
        await Transaction.update(
            { status: "failed", providerResponse: response },
            { where: { reference } }
        );
    }
}
