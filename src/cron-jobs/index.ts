import { initWalletCron } from "@/cron-jobs/wallet-jobs";

export function initializeCronJobs(): void {
    initWalletCron();
}
