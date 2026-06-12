import { Op, literal } from "sequelize";
import SavingsGoal from "@/shared/database/models/saving-goal.model";

export class SavingsGoalRepository {
    async create(goal: Partial<SavingsGoal>): Promise<SavingsGoal> {
        return await SavingsGoal.create(goal);
    }

    async update(goal: SavingsGoal): Promise<SavingsGoal> {
        await goal.save();
        return goal;
    }

    async delete(id: string): Promise<void> {
        await SavingsGoal.destroy({ where: { id } });
    }

    async getByID(id: string): Promise<SavingsGoal | null> {
        return await SavingsGoal.findOne({ where: { id } });
    }

    async getByUserID(userID: string): Promise<SavingsGoal[]> {
        return await SavingsGoal.findAll({
            where: { userId: userID },
            order: [["createdAt", "DESC"]],
        });
    }

    async getActiveByUserID(userID: string): Promise<SavingsGoal[]> {
        return await SavingsGoal.findAll({
            where: { userId: userID, status: "active" },
            order: [["targetDate", "ASC"]],
        });
    }

    async getByStatus(status: string): Promise<SavingsGoal[]> {
        return await SavingsGoal.findAll({ where: { status } });
    }

    async updateCurrentAmount(goalID: string, amount: number): Promise<void> {
        await SavingsGoal.update(
            { currentAmount: amount },
            { where: { id: goalID } }
        );
    }

    async withdraw(goalID: string): Promise<void> {
        await SavingsGoal.update(
            { status: "withdrawn", withdrawnAt: new Date() },
            { where: { id: goalID } }
        );
    }

    async cancel(goalID: string): Promise<void> {
        await SavingsGoal.update({ status: "cancelled" }, { where: { id: goalID } });
    }

    async getAutoDebitGoals(): Promise<SavingsGoal[]> {
        return await SavingsGoal.findAll({
            where: { isAutoDebit: true, status: "active" },
        });
    }

    async getCompletedGoals(): Promise<SavingsGoal[]> {
        return await SavingsGoal.findAll({
            where: {
                [Op.or]: [
                    { status: "active" },
                    { currentAmount: { [Op.gte]: literal("target_amount") } },
                ],
            },
        });
    }
}
