import { type Request, type Response, type NextFunction } from "express";
import { type BillPaymentService } from "@/modules/bill-payment/bill-payment.service";
import { getUserIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";

export class BillController {
    constructor(
        private readonly billService: BillPaymentService
    ) { }

    // ===== AIRTIME =====
    async getAirtimeNetworks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.billService.getAirtimeNetworks();
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async purchaseAirtime(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.billService.purchaseAirtime(userId, req.body);
            res.json({ success: true, message: "Airtime purchased successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getAirtimeHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.billService.getAirtimeHistory(userId, offset, limit);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // ===== DATA =====
    async getDataNetworks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.billService.getDataNetworks();
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getDataPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const network = req.params.network;
            if (!network) {
                res.status(400).json({ error: "Validation Error", message: "Network is required" });
                return;
            }
            const resp = await this.billService.getDataPlans(network);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async purchaseData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.billService.purchaseData(userId, req.body);
            res.json({ success: true, message: "Data purchased successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getDataHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.billService.getDataHistory(userId, offset, limit);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // ===== ELECTRICITY =====
    async getElectricityProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.billService.getElectricityProviders();
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async validateMeter(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.billService.validateMeter(req.body);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async payElectricity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.billService.payElectricity(userId, req.body);
            res.json({ success: true, message: "Electricity bill paid successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getElectricityToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const transactionId = req.params.transaction_id;
            if (!transactionId) {
                res.status(400).json({ error: "Validation Error", message: "Transaction ID is required" });
                return;
            }
            const token = await this.billService.getElectricityToken(userId, transactionId);
            res.json({ success: true, data: { token } });
        } catch (err) {
            next(err);
        }
    }

    async getElectricityHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.billService.getElectricityHistory(userId, offset, limit);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // ===== BETTING =====
    async getBettingProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.billService.getBettingProviders();
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async validateBettingAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resp = await this.billService.validateBettingAccount(req.body);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    async fundBettingWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const resp = await this.billService.fundBettingWallet(userId, req.body);
            res.json({ success: true, message: "Betting wallet funded successfully", data: resp });
        } catch (err) {
            next(err);
        }
    }

    async getBettingHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.billService.getBettingHistory(userId, offset, limit);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }

    // ===== GENERAL BILL HISTORY =====
    async getBillHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserIdFromRequest(req);
            const offset = parseInt(req.query.offset as string) || 0;
            const limit = parseInt(req.query.limit as string) || 20;
            const resp = await this.billService.getBillHistory(userId, offset, limit);
            res.json({ success: true, data: resp });
        } catch (err) {
            next(err);
        }
    }
}
