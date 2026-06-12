import { type Request, type Response, type NextFunction } from "express";
import { type SavingsService } from "@/modules/savings/savings.service";
import { getUserIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";

export class SavingsController {
    constructor(
        private readonly savingsService: SavingsService
    ) { }

    async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.savingsService.createGoal(userId, req.body);
            res.status(201).json({ success: true, message: "Savings goal created successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async contributeToGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.savingsService.contributeToGoal(userId, req.body);
            res.json({ success: true, message: "Contribution added successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.savingsService.getGoals(userId);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const goalId = req.params.id;
            if (!goalId) {
                res.status(400).json({ error: "Validation Error", message: "Goal ID is required" });
                return;
            }
            const resp = await this.savingsService.getGoal(userId, goalId);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const goalId = req.params.id;
            if (!goalId) {
                res.status(400).json({ error: "Validation Error", message: "Goal ID is required" });
                return;
            }
            await this.savingsService.updateGoal(userId, goalId, req.body);
            res.json({ success: true, message: "Savings goal updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const goalId = req.params.id;
            if (!goalId) {
                res.status(400).json({ error: "Validation Error", message: "Goal ID is required" });
                return;
            }
            await this.savingsService.deleteGoal(userId, goalId);
            res.json({ success: true, message: "Savings goal deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async activateRoundup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            await this.savingsService.activateRoundup(userId, req.body);
            res.json({ success: true, message: "Auto roundup activated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async deactivateRoundup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            await this.savingsService.deactivateRoundup(userId);
            res.json({ success: true, message: "Auto roundup deactivated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getRoundupStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.savingsService.getRoundupStatus(userId);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }
}
