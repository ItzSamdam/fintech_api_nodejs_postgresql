import { Op, type WhereOptions, type Transaction } from 'sequelize';
import { User } from '@/shared/database/models';

export class UserRepository {
    async create(user: Partial<User>, transaction?: Transaction): Promise<User> {
        return await User.create(user, { transaction });
    }

    async update(user: User, transaction?: Transaction): Promise<User> {
        await user.save({ transaction });
        return user;
    }

    async delete(id: string, transaction?: Transaction): Promise<number> {
        return await User.destroy({ where: { id }, transaction });
    }

    async softDelete(id: string, transaction?: Transaction): Promise<number> {
        const [affectedCount] = await User.update({ deletedAt: new Date() }, { where: { id }, transaction });
        return affectedCount;
    }

    async getById(id: string): Promise<User | null> {
        return await User.findOne({ where: { id } });
    }

    async getByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return await User.findOne({ where: { phoneNumber } });
    }

    async getByEmail(email: string): Promise<User | null> {
        return await User.findOne({ where: { email } });
    }

    async getByBVN(bvn: string): Promise<User | null> {
        return await User.findOne({ where: { bvn } });
    }

    async getByNIN(nin: string): Promise<User | null> {
        return await User.findOne({ where: { nin } });
    }

    async getUserCount(): Promise<number> {
        return await User.count();
    }

    async list(
        offset: number,
        limit: number,
        filters: Record<string, any>
    ): Promise<{ users: User[]; total: number }> {
        const where: WhereOptions = {};

        if (filters.tier) where.tier = filters.tier;
        if (filters.is_active !== undefined) where.isActive = filters.is_active;
        if (filters.is_suspended !== undefined) where.isSuspended = filters.is_suspended;
        if (filters.from_date) where.createdAt = { [Op.gte]: filters.from_date };
        if (filters.to_date) {
            where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.to_date };
        }

        const total = await User.count({ where });
        const users = await User.findAll({
            where,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });

        return { users, total };
    }

    async updateTier(userId: string, tier: number): Promise<void> {
        await User.update({ tier }, { where: { id: userId } });
    }

    async updateLastLogin(userId: string, ip: string): Promise<void> {
        await User.update(
            { lastLoginAt: new Date(), lastLoginIp: ip },
            { where: { id: userId } }
        );
    }

    async suspend(userId: string, reason: string): Promise<void> {
        await User.update(
            {
                isSuspended: true,
                suspensionReason: reason,
                suspendedAt: new Date(),
            },
            { where: { id: userId } }
        );
    }

    async unsuspend(userId: string): Promise<void> {
        await User.update(
            {
                isSuspended: false,
                suspensionReason: null,
                suspendedAt: null,
            },
            { where: { id: userId } }
        );
    }

    async search(query: string, offset: number, limit: number): Promise<{ users: User[]; total: number }> {
        const searchQuery = `%${query}%`;

        const total = await User.count({
            where: {
                [Op.or]: [
                    { phoneNumber: { [Op.iLike]: searchQuery } },
                    { email: { [Op.iLike]: searchQuery } },
                ],
            },
        });

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { phoneNumber: { [Op.iLike]: searchQuery } },
                    { email: { [Op.iLike]: searchQuery } },
                ],
            },
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });

        return { users, total };
    }

    async countByDateRange(startDate: Date, endDate: Date): Promise<number> {
        return await User.count({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
            },
        });
    }

    async getActiveUsers(): Promise<number> {
        return await User.count({
            where: { isActive: true, isSuspended: false },
        });
    }
}
