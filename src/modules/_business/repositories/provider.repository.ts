import {Provider} from "@/shared/database/models";

export class ProviderRepository {
    async create(provider: Partial<Provider>): Promise<Provider> {
        return await Provider.create(provider);
    }

    async update(provider: Provider): Promise<Provider> {
        await provider.save();
        return provider;
    }

    async getByID(id: string): Promise<Provider | null> {
        return await Provider.findOne({ where: { id } });
    }

    async getByCode(code: string): Promise<Provider | null> {
        return await Provider.findOne({ where: { code } });
    }

    async getByType(providerType: string): Promise<Provider[]> {
        return await Provider.findAll({ where: { type: providerType } });
    }

    async getActiveByType(providerType: string): Promise<Provider[]> {
        return await Provider.findAll({
            where: { type: providerType, isActive: true },
            order: [["priority", "ASC"]],
        });
    }

    async getByPriority(providerType: string): Promise<Provider[]> {
        return await Provider.findAll({
            where: { type: providerType, isActive: true },
            order: [["priority", "ASC"]],
        });
    }

    async toggleActive(id: string, isActive: boolean): Promise<void> {
        await Provider.update({ isActive }, { where: { id } });
    }

    async updatePriority(id: string, priority: number): Promise<void> {
        await Provider.update({ priority }, { where: { id } });
    }

    async updateHealthStatus(id: string, status: string, lastCheck: Date): Promise<void> {
        await Provider.update(
            { healthStatus: status, lastHealthCheck: lastCheck },
            { where: { id } }
        );
    }

    async updateMargin(id: string, marginPercent: number): Promise<void> {
        await Provider.update({ marginPercent }, { where: { id } });
    }

    async list(
        offset: number,
        limit: number,
        filters: Record<string, any>
    ): Promise<{ providers: Provider[]; total: number }> {
        const where: any = {};
        if (filters.type) where.type = filters.type;
        if (filters.is_active !== undefined) where.isActive = filters.is_active;

        const total = await Provider.count({ where });
        const providers = await Provider.findAll({
            where,
            offset,
            limit,
            order: [["priority", "ASC"]],
        });

        return { providers, total };
    }
}
