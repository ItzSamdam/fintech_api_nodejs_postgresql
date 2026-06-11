import {Role} from "@/shared/database/models";

export class RoleRepository {
    async create(role: Partial<Role>): Promise<Role> {
        return await Role.create(role);
    }

    async update(role: Role): Promise<Role> {
        await role.save();
        return role;
    }

    async delete(id: string): Promise<void> {
        await Role.destroy({ where: { id } });
    }

    async getByID(id: string): Promise<Role | null> {
        return await Role.findOne({ where: { id } });
    }

    async getByName(name: string): Promise<Role | null> {
        return await Role.findOne({ where: { name } });
    }

    async list(): Promise<Role[]> {
        return await Role.findAll();
    }

    async getPermissions(roleName: string): Promise<string[]> {
        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) return [];

        let permissions: string[] = [];
        if (role.permissions) {
            if (typeof role.permissions === "string") {
                try {
                    permissions = JSON.parse(role.permissions);
                } catch (err) {
                    console.error("Failed to parse permissions JSON:", err);
                }
            } else if (Array.isArray(role.permissions)) {
                permissions = role.permissions;
            } else {
                permissions = Object.values(role.permissions) as string[];
            }
        }
        return permissions;
    }
}
