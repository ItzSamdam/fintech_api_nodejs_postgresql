import { type Request, type Response, type NextFunction } from "express";
import { type AdminService } from "@/modules/admin-user/admin-user.service";

export class RoleAdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // GET /admin/roles
    async listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roles = await this.adminService.listRoles();
            res.json({ success: true, data: roles });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/roles
    async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const role = await this.adminService.createRole(req.body);
            res.status(201).json({ success: true, message: "Role created successfully", data: role });
        } catch (err) {
            next(err);
        }
    }

    // PUT /admin/roles/:id
    async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roleId = req.params.id;
            const role = await this.adminService.updateRole(roleId, req.body);
            res.json({ success: true, message: "Role updated successfully", data: role });
        } catch (err) {
            next(err);
        }
    }

    // DELETE /admin/roles/:id
    async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roleId = req.params.id;
            await this.adminService.deleteRole(roleId);
            res.json({ success: true, message: "Role deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/staff
    async listStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const { staff, total } = await this.adminService.listStaff(offset, limit);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: staff,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    // POST /admin/staff/invite
    async inviteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.adminService.inviteStaff(req.body);
            res.json({ success: true, message: "Staff invitation sent successfully" });
        } catch (err) {
            next(err);
        }
    }

    // PUT /admin/staff/:id/role
    async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.params.id;
            const { role } = req.body;
            await this.adminService.assignRole(staffId, role as string);
            res.json({ success: true, message: "Role assigned successfully" });
        } catch (err) {
            next(err);
        }
    }

    // DELETE /admin/staff/:id
    async removeStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.params.id;
            await this.adminService.removeStaff(staffId);
            res.json({ success: true, message: "Staff removed successfully" });
        } catch (err) {
            next(err);
        }
    }

    // GET /admin/staff/:id/audit
    async getStaffAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.params.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const { logs, total } = await this.adminService.getStaffAudit(staffId, offset, limit);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: {
                    data: logs,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });
        } catch (err) {
            next(err);
        }
    }
}
