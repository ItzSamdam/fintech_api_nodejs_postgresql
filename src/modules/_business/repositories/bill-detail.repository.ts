import { BillDetail, Transaction } from "@/shared/database/models";

export class BillDetailRepository {
    
    async create(detail: Partial<BillDetail>): Promise<BillDetail> {
        return await BillDetail.create(detail);
    }

    async getByTransactionID(transactionID: string): Promise<BillDetail | null> {
        return await BillDetail.findOne({ where: { transactionId: transactionID } });
    }

    async getByType(
        userID: string,
        billType: string,
        offset: number,
        limit: number
    ): Promise<{ details: BillDetail[]; total: number }> {
        const where = { billType };

        const total = await BillDetail.count({
            include: [{ model: Transaction, where: { userId: userID } }],
            where,
        });

        const details = await BillDetail.findAll({
            include: [{ model: Transaction, where: { userId: userID } }],
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        return { details, total };
    }

    async getByPhoneNumber(
        phoneNumber: string,
        offset: number,
        limit: number
    ): Promise<{ details: BillDetail[]; total: number }> {
        const where = { phoneNumber };

        const total = await BillDetail.count({ where });
        const details = await BillDetail.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        return { details, total };
    }

    async getByMeterNumber(
        meterNumber: string,
        offset: number,
        limit: number
    ): Promise<{ details: BillDetail[]; total: number }> {
        const where = { meterNumber };

        const total = await BillDetail.count({ where });
        const details = await BillDetail.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        return { details, total };
    }

    async updateToken(transactionID: string, token: string, units: number): Promise<void> {
        await BillDetail.update(
            { electricityToken: token, electricityUnits: units },
            { where: { transactionId: transactionID } }
        );
    }
}
