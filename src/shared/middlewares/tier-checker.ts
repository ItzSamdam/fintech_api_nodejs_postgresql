// src/middleware/tierLimiter.ts
import { type Request, type Response, type NextFunction } from "express";
import { TierLimit, Wallet } from "@/models";
import { getUserFromRequest } from "@/middleware/auth-helpers";

export const checkTierLimit = (action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = getUserFromRequest(req);

        const tierLimit = await TierLimit.findOne({ where: { tier: user.tier } });
        if (!tierLimit) {
            return res.status(500).json({ error: "Failed to fetch tier limits" });
        }

        const permissions: Record<string, boolean> = {
            send_money: tierLimit.canSendMoney,
            buy_airtime: tierLimit.canBuyAirtime,
            buy_data: tierLimit.canBuyData,
            pay_electricity: tierLimit.canPayElectricity,
            fund_betting: tierLimit.canFundBetting,
            save: tierLimit.canSave,
        };

        if (!permissions[action]) {
            return res.status(403).json({
                error: "Action not allowed for your tier",
                tier: user.tier,
                action,
                upgrade_required: true,
            });
        }

        req.tierLimit = tierLimit;
        next();
    };
};

export const checkTransactionLimit = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = getUserFromRequest(req);

        const { amount } = req.body;
        if (!amount) { next(); return; }

        const tierLimit = await TierLimit.findOne({ where: { tier: user.tier } });
        if (!tierLimit) {
            return res.status(500).json({ error: "Failed to fetch tier limits" });
        }

        if (amount > tierLimit.singleTxLimit) {
            return res.status(403).json({
                error: "Transaction amount exceeds tier limit",
                amount,
                max_allowed: tierLimit.singleTxLimit,
                tier: user.tier,
                upgrade_needed: true,
            });
        }

        const wallet = await Wallet.findOne({ where: { user_id: user.id } });
        if (!wallet) {
            return res.status(500).json({ error: "Failed to fetch wallet" });
        }

        if (wallet.dailySpent + amount > tierLimit.dailyLimit) {
            return res.status(403).json({
                error: "Daily transaction limit exceeded",
                daily_spent: wallet.dailySpent,
                daily_limit: tierLimit.dailyLimit,
                remaining: tierLimit.dailyLimit - wallet.dailySpent,
            });
        }

        req.tierLimit = tierLimit;
        req.wallet = wallet;
        next();
    };
};
