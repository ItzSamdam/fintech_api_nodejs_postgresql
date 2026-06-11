import { literal } from "sequelize";
import AutoRoundup from "@/shared/database/models/auto-roundup.model";

export class AutoRoundupRepository {
    async create(roundup: Partial<AutoRoundup>): Promise<AutoRoundup> {
        return await AutoRoundup.create(roundup);
    }

    async update(roundup: AutoRoundup): Promise<AutoRoundup> {
        await roundup.save();
        return roundup;
    }

    async getByUserID(userID: string): Promise<AutoRoundup | null> {
        return await AutoRoundup.findOne({ where: { userId: userID } });
    }

    async getActive(): Promise<AutoRoundup[]> {
        return await AutoRoundup.findAll({ where: { isActive: true } });
    }

    async deactivate(userID: string): Promise<void> {
        await AutoRoundup.update({ isActive: false }, { where: { userId: userID } });
    }

    async updateTotalRoundup(userID: string, amount: number): Promise<void> {
        await AutoRoundup.update(
            { totalRoundup: literal(`total_roundup + ${amount}`) },
            { where: { userId: userID } }
        );
    }
}
