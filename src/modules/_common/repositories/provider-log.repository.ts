import { ProviderLog } from "@/shared/database/models";
import { literal, Op } from "sequelize";

export class ProviderLogRepository {
    async create(log: Partial<ProviderLog>): Promise<ProviderLog> {
        return await ProviderLog.create(log);
    }

    async getByProviderID(
        providerID: string,
        offset: number,
        limit: number
    ): Promise<{ logs: ProviderLog[]; total: number }> {
        const where = { providerId: providerID };
        const total = await ProviderLog.count({ where });
        const logs = await ProviderLog.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        return { logs, total };
    }

    async getByTransactionID(transactionID: string): Promise<ProviderLog | null> {
        return await ProviderLog.findOne({ where: { transactionId: transactionID } });
    }

    async getErrorLogs(startDate: Date, endDate: Date): Promise<ProviderLog[]> {
        return await ProviderLog.findAll({
            where: {
                isError: true,
                createdAt: { [Op.between]: [startDate, endDate] },
            },
            order: [["createdAt", "DESC"]],
        });
    }

    async getProviderStats(providerID: string, startDate: Date, endDate: Date): Promise<any> {
        const stats: any = await ProviderLog.findOne({
            where: { providerId: providerID, createdAt: { [Op.between]: [startDate, endDate] } },
            attributes: [
                [literal("COUNT(*)"), "totalRequests"],
                [literal("SUM(CASE WHEN is_error = false THEN 1 ELSE 0 END)"), "successCount"],
                [literal("SUM(CASE WHEN is_error = true THEN 1 ELSE 0 END)"), "failedCount"],
                [literal("AVG(response_time)"), "avgResponseTime"],
            ],
            raw: true,
        });

        if (stats.totalRequests > 0) {
            stats.successRate = (stats.successCount / stats.totalRequests) * 100;
        }
        return stats;
    }
}