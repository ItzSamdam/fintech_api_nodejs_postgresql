import { type Application } from "express";
import BaseRoutesConfig from "./baseRoutes";
import { SavingsController } from "@/modules/savings/savings.controller";
import { SavingsService } from "@/modules/savings/savings.service";

const savingsService = new SavingsService(

);
const controller = new SavingsController(savingsService);

class SavingsRoutesConfig extends BaseRoutesConfig {
    constructor(app: Application) {
        super(app, "SavingsRoutes");
    }

    configureRoutes(): Application {
        this.app.route("/savings").get(controller.listSavings.bind(controller));
        this.app.route("/savings/:id").get(controller.getSavingsDetails.bind(controller));
        this.app.route("/savings/create").post(controller.createSavings.bind(controller));
        this.app.route("/savings/:id/deposit").post(controller.deposit.bind(controller));
        this.app.route("/savings/:id/withdraw").post(controller.withdraw.bind(controller));
        this.app.route("/savings/:id/close").post(controller.closeSavings.bind(controller));
        return this.app;
    }
}

export default SavingsRoutesConfig;
