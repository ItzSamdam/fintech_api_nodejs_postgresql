import { Op } from "sequelize";
import {AuditLog} from "@/shared/database/models";

export class AuditLogRepository {
  async create(log: Partial<AuditLog>): Promise<AuditLog> {
    return await AuditLog.create(log);
  }

  async getByID(id: string): Promise<AuditLog | null> {
    return await AuditLog.findOne({ where: { id } });
  }

  async getByAdminID(
    adminID: string,
    offset: number,
    limit: number
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const where = { adminId: adminID };
    const total = await AuditLog.count({ where });
    const logs = await AuditLog.findAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return { logs, total };
  }

  async getByUserID(
    userID: string,
    offset: number,
    limit: number
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const where = { userId: userID };
    const total = await AuditLog.count({ where });
    const logs = await AuditLog.findAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return { logs, total };
  }

  async getByAction(
    action: string,
    startDate: Date,
    endDate: Date
  ): Promise<AuditLog[]> {
    return await AuditLog.findAll({
      where: {
        action,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      order: [["createdAt", "DESC"]],
    });
  }

  async list(
    offset: number,
    limit: number,
    filters: Record<string, any>
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const where: any = {};
    if (filters.admin_id) where.adminId = filters.admin_id;
    if (filters.action) where.action = filters.action;
    if (filters.from_date) where.createdAt = { [Op.gte]: filters.from_date };
    if (filters.to_date)
      where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.to_date };

    const total = await AuditLog.count({ where });
    const logs = await AuditLog.findAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    return { logs, total };
  }

  async getAdminActions(
    adminID: string,
    startDate: Date,
    endDate: Date
  ): Promise<AuditLog[]> {
    return await AuditLog.findAll({
      where: {
        adminId: adminID,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      order: [["createdAt", "DESC"]],
    });
  }
}
