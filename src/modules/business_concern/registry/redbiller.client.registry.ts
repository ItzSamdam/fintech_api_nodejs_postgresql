import axios, { type AxiosInstance } from "axios";

export interface RedBillerResponse {
    success: boolean;
    message: string;
    data: any;
}

export class RedBillerClient {
    private readonly http: AxiosInstance;

    constructor(private readonly baseURL: string, private readonly privateKey: string) {
        this.http = axios.create({
            baseURL,
            timeout: 30000,
            headers: { "Private-Key": privateKey, "Content-Type": "application/json" },
        });
    }

    private async doRequest(method: "GET" | "POST", endpoint: string, body?: any): Promise<RedBillerResponse> {
        try {
            const resp = await this.http.request({ method, url: endpoint, data: body });
            const result = resp.data;
            const success = !(result.status === "error" || result.status === "failed");
            return { success, message: result.message || "", data: result };
        } catch (err: any) {
            return { success: false, message: err.message, data: {} };
        }
    }

    // Wallet
    async getWalletBalance(): Promise<RedBillerResponse> {
        return await this.doRequest("GET", "/1.0/get/balance");
    }

    // Banks
    async fetchBanks(bankType: string, countryCode: string, currencyCode: string): Promise<RedBillerResponse> {
        return await this.doRequest(
            "GET",
            `/1.0/payout/bank-transfer/banks/list?type=${bankType}&country_code=${countryCode}&currency_code=${currencyCode}`
        );
    }

    // Transfers
    async sendMoney(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/2.0/payout/bank-transfer/create", req);
    }

    async retrySendMoney(reference: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/2.0/payout/bank-transfer/retry", { reference });
    }

    async verifyTransaction(reference: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/payout/bank-transfer/status", { reference });
    }

    // Accounts
    async suggestBank(accountNo: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/payout/bank-transfer/banks/suggest", { account_no: accountNo });
    }

    async verifyAccountDetails(accountNo: string, bankCode: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/kyc/bank-account/verify", { account_no: accountNo, bank_code: bankCode });
    }

    async createVirtualAccount(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/collections/PSA/create", req);
    }

    async verifyVirtualAccountPayment(reference: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/collections/PSA/payments/verify", { reference });
    }

    // Bills (Disco, Cable, Airtime, Data, Betting)
    async verifyDisco(product: string, meterNo: string, meterType: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/disco/meter/verify", { product, meter_no: meterNo, meter_type: meterType });
    }

    async purchaseDisco(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.1/bills/disco/purchase/create", req);
    }

    async getCablePlans(product: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/cable/plans/list", { product });
    }

    async verifyCable(product: string, smartCardNo: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/cable/decoder/verify", { product, smart_card_no: smartCardNo });
    }

    async purchaseCable(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.1/bills/cable/plans/purchase/create", req);
    }

    async purchaseTopUp(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/airtime/purchase/create", req);
    }

    async getDataPlans(product: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/data/plans/list", { product });
    }

    async purchaseData(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/data/plans/purchase/create", req);
    }

    // Betting
    async getBetProviders(): Promise<RedBillerResponse> {
        return await this.doRequest("GET", "/1.5/bills/betting/providers/list");
    }

    async creditBetWallet(req: any): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.5/bills/betting/account/payment/create", req);
    }

    async verifyBetWallet(product: string, customerId: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.5/bills/betting/account/verify", { product, customer_id: customerId });
    }

    // KYC
    async verifyBVN(bvn: string, reference: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/kyc/bvn/verify.3.0", { bvn, reference });
    }

    // Generic transaction verification
    async verifyAnyTransaction(reference: string, txnType: string): Promise<RedBillerResponse> {
        const endpoints: Record<string, string> = {
            betting: "/1.4/bills/betting/account/payment/status",
            disco: "/1.0/bills/disco/purchase/status",
            cable: "/1.0/bills/cable/plans/purchase/status",
            data: "/1.0/bills/data/plans/purchase/status",
            airtime: "/1.0/bills/airtime/purchase/status",
            transfer: "/1.0/payout/bank-transfer/status",
        };
        const endpoint = endpoints[txnType];
        if (!endpoint) return { success: false, message: `Unsupported transaction type: ${txnType}`, data: {} };
        return await this.doRequest("POST", endpoint, { reference });
    }
}
