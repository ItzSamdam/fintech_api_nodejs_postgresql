import { TransferDetail } from "@/shared/database/models";

export class TransferDetailRepository {
    async create(detail: Partial<TransferDetail>): Promise<TransferDetail> {
        return await TransferDetail.create(detail);
    }

    async getByTransactionID(transactionID: string): Promise<TransferDetail | null> {
        return await TransferDetail.findOne({ where: { transactionId: transactionID } });
    }

    async getByRecipientID(
        recipientID: string,
        offset: number,
        limit: number
    ): Promise<{ details: TransferDetail[]; total: number }> {
        const where = { recipientId: recipientID };

        const total = await TransferDetail.count({ where });
        const details = await TransferDetail.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        return { details, total };
    }
}
