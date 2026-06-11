import cron from "node-cron";
import { Wallet } from "@/shared/database/models";

export function initWalletCron(): void {
    // Reset dailySpent at midnight every day
    cron.schedule("0 0 * * *", async () => {
        await Wallet.update({ dailySpent: 0 }, { where: {} });
        console.log("✅ Daily wallet limits reset");
    });

    // Reset weeklySpent every Monday at midnight
    cron.schedule("0 0 * * 1", async () => {
        await Wallet.update({ weeklySpent: 0 }, { where: {} });
        console.log("✅ Weekly wallet limits reset");
    });

    // Reset monthlySpent on the 1st of each month at midnight
    cron.schedule("0 0 1 * *", async () => {
        await Wallet.update({ monthlySpent: 0 }, { where: {} });
        console.log("✅ Monthly wallet limits reset");
    });
}