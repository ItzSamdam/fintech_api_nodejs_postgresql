import { Op } from "sequelize";
import {Session} from "@/shared/database/models";

export class SessionRepository {
    async create(session: Partial<Session>): Promise<Session> {
        return await Session.create(session);
    }

    async update(session: Session): Promise<Session> {
        await session.save();
        return session;
    }

    async getByToken(token: string): Promise<Session | null> {
        return await Session.findOne({ where: { token } });
    }

    async getByUserID(userID: string): Promise<Session[]> {
        return await Session.findAll({
            where: { userId: userID, isActive: true },
            order: [["lastActiveAt", "DESC"]],
        });
    }

    async invalidate(sessionID: string): Promise<void> {
        await Session.update({ isActive: false }, { where: { id: sessionID } });
    }

    async invalidateAllUserSessions(userID: string): Promise<void> {
        await Session.update({ isActive: false }, { where: { userId: userID } });
    }

    async cleanupExpired(): Promise<void> {
        const now = new Date();
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        await Session.update(
            { isActive: false },
            {
                where: {
                    [Op.or]: [
                        { expiresAt: { [Op.lt]: now } },
                        { isActive: true, lastActiveAt: { [Op.lt]: cutoff } },
                    ],
                },
            }
        );
    }

    async extendSession(sessionID: string, newExpiry: Date): Promise<void> {
        await Session.update(
            { expiresAt: newExpiry, lastActiveAt: new Date() },
            { where: { id: sessionID } }
        );
    }
}
