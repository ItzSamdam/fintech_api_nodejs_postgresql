import { Op, literal } from "sequelize";
import {SavingContribution} from "@/shared/database/models";

export class SavingContributionRepository {
    async create(contribution: Partial<SavingContribution>): Promise<SavingContribution> {
        return await SavingContribution.create(contribution);
    }

    async getByGoalID(
        goalID: string,
        offset: number,
        limit: number
    ): Promise<{ contributions: SavingContribution[]; total: number }> {
        const where = { savingsGoalId: goalID };

        const total = await SavingContribution.count({ where });
        const contributions = await SavingContribution.findAll({
            where,
            offset,
            limit,
            order: [["contributionDate", "DESC"]],
        });

        return { contributions, total };
    }

    async getByTransactionID(transactionID: string): Promise<SavingContribution | null> {
        return await SavingContribution.findOne({ where: { transactionId: transactionID } });
    }

    async getTotalContributions(goalID: string): Promise<number> {
        const result = await SavingContribution.findOne({
            where: { savingsGoalId: goalID },
            attributes: [[literal("COALESCE(SUM(amount), 0)"), "total"]],
            raw: true,
        }) as { total: number } | null;
        return Number(result?.total ?? 0);
    }

    async getContributionsByDateRange(
        goalID: string,
        startDate: Date,
        endDate: Date
    ): Promise<SavingContribution[]> {
        return await SavingContribution.findAll({
            where: {
                savingsGoalId: goalID,
                contributionDate: { [Op.between]: [startDate, endDate] },
            },
            order: [["contributionDate", "ASC"]],
        });
    }
}
