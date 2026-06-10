import {AdminUser} from "@/shared/database/models";

export class AdminUserRepository {
    async create(admin: Partial<AdminUser>): Promise<AdminUser> {
        return await AdminUser.create(admin);
    }

    async update(admin: AdminUser): Promise<AdminUser> {
        await admin.save();
        return admin;
    }

    async delete(id: string): Promise<void> {
        await AdminUser.destroy({ where: { id } });
    }

    async getByID(id: string): Promise<AdminUser | null> {
        return await AdminUser.findOne({ where: { id } });
    }

    async getByEmail(email: string): Promise<AdminUser | null> {
        return await AdminUser.findOne({ where: { email } });
    }

    async list(offset: number, limit: number): Promise<{ admins: AdminUser[]; total: number }> {
        const total = await AdminUser.count();
        const admins = await AdminUser.findAll({
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        return { admins, total };
    }

    async updateLastLogin(id: string, ip: string): Promise<void> {
        await AdminUser.update(
            { lastLoginAt: new Date() },
            { where: { id } }
        );
    }

    async updateRole(id: string, role: string): Promise<void> {
        await AdminUser.update({ role }, { where: { id } });
    }

    async deactivate(id: string): Promise<void> {
        await AdminUser.update({ isActive: false }, { where: { id } });
    }

    async activate(id: string): Promise<void> {
        await AdminUser.update({ isActive: true }, { where: { id } });
    }
}
