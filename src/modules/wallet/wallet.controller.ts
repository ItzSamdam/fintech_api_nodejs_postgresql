import { type Request, type Response, type NextFunction } from "express";
import { type WalletService } from "@/modules/wallet/wallet.service";
import { getUserIdFromRequest } from "@/shared/middlewares/auth/auth-helpers";

export class WalletController {
  constructor(
    private readonly walletService: WalletService
  ) { }

  async createWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const currency: string = req.body.currency || "NGN";

      const resp = await this.walletService.createWallet(userId, currency);

      res.json({ success: true, message: "Wallet created successfully", data: resp });
    } catch (err) {
      next(err);
    }
  }

  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const resp = await this.walletService.getWallet(userId);
      res.json({ success: true, data: resp });
    } catch (err) {
      next(err);
    }
  }

  async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const resp = await this.walletService.getBalance(userId);
      res.json({ success: true, data: resp });
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const resp = await this.walletService.getTransactions(userId, req.query);
      res.json({ success: true, data: resp });
    } catch (err) {
      next(err);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const transactionId = req.params.id;
      if (!transactionId) throw new Error("Transaction ID required");

      const resp = await this.walletService.getTransactionByID(userId, transactionId);
      res.json({ success: true, data: resp });
    } catch (err) {
      next(err);
    }
  }

  async getLimits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const resp = await this.walletService.getLimits(userId);
      res.json({ success: true, data: resp });
    } catch (err) {
      next(err);
    }
  }

  async lockWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      await this.walletService.lockWallet(userId, req.body.reason as string);
      res.json({ success: true, message: "Wallet locked successfully" });
    } catch (err) {
      next(err);
    }
  }

  async unlockWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      await this.walletService.unlockWallet(userId);
      res.json({ success: true, message: "Wallet unlocked successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getStatement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromRequest(req);

      const { data, mimeType } = await this.walletService.getStatement(userId, req.query);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename=statement.${mimeType.split("/")[1]}`);
      res.send(data);
    } catch (err) {
      next(err);
    }
  }
}
