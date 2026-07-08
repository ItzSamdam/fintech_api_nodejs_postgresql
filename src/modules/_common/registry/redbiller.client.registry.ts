import axios, { type AxiosInstance } from "axios";
import {config} from "@/shared/config";
export interface RedBillerResponse {
    success: boolean;
    message: string;
    data: any;
}

export class RedBillerClient {
    private readonly http: AxiosInstance;
    private readonly privateKey = config.redbiller.privateKey;
    private readonly baseURL = "https://api.redbiller.com";

    constructor() {
        this.http = axios.create({
            baseURL: this.baseURL,  // Explicitly use the class property
            timeout: 30000,
            headers: { "Private-Key": this.privateKey, "Content-Type": "application/json" },
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
    async sendMoney(
        accountNo: string,
        bankCode: string,
        amount: string,
        narration: string,
        callbackUrl: string,
        reference: string
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/2.0/payout/bank-transfer/create", {
            account_no: accountNo,
            bank_code: bankCode,
            amount,
            narration,
            callback_url: callbackUrl,
            reference,
        });
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

    async verifyAccountDetails(
        accountNo: string,
        bankCode: string
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/kyc/bank-account/verify", {
            account_no: accountNo,
            bank_code: bankCode
        });
    }

    async createVirtualAccount(
        bank: string,
        firstName: string,
        surname: string,
        phoneNo: string,
        email: string,
        bvn: string,
        dateOfBirth: string,
        autoSettlement: boolean,
        callbackUrl: string,
        reference: string,
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/collections/PSA/create", {
            bank,
            first_name: firstName,
            surname,
            phone_no: phoneNo,
            email,
            bvn,
            date_of_birth: dateOfBirth,
            auto_settlement: autoSettlement,
            callback_url: callbackUrl,
            reference,
        });
    }

    async verifyVirtualAccountPayment(
        reference: string
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/collections/PSA/payments/verify", { reference });
    }

    // Bills (Disco, Cable, Airtime, Data, Betting)
    async verifyDisco(
        product: string,
        meterNo: string,
        meterType: string
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/disco/meter/verify", { product, meter_no: meterNo, meter_type: meterType });
    }

    async purchaseDisco(
        product: string,
        meterNo: string,
        customerName: string,
        meterType: string,
        phoneNo: string,
        amount: string,
        callbackUrl: string,
        reference: string,
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.1/bills/disco/purchase/create", {
            product,
            meter_no: meterNo,
            customer_name: customerName,
            meter_type: meterType,
            phone_no: phoneNo,
            amount,
            callback_url: callbackUrl,
            reference,
        });
    }

    async getCablePlans(product: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/cable/plans/list", { product });
    }

    async verifyCable(product: string, smartCardNo: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/cable/decoder/verify", { product, smart_card_no: smartCardNo });
    }

    async purchaseCable(
        product: string,
        smartCardNo: string,
        customerName: string,
        phoneNo: string,
        code: string,
        callbackUrl: string,
        reference: string,
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.1/bills/cable/plans/purchase/create", {
            product,
            code,
            smart_card_no: smartCardNo,
            customer_name: customerName,
            phone_no: phoneNo,
            callback_url: callbackUrl,
            reference,
        });
    }

    async purchaseTopUp(
        product: string,
        phoneNo: string,
        amount: string,
        ported: boolean,
        callbackUrl: string,
        reference: string,
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/airtime/purchase/create", {
            product,
            phone_no: phoneNo,
            amount,
            ported,
            callback_url: callbackUrl,
            reference,
        });
    }

    async getDataPlans(product: string): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/data/plans/list", { product });
    }

    async purchaseData(
        product: string,
        phoneNo: string,
        code: string,
        ported: boolean,
        callbackUrl: string,
        reference: string,
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.0/bills/data/plans/purchase/create", {
            product,
            phone_no: phoneNo,
            code,
            ported,
            callback_url: callbackUrl,
            reference,
        });
    }

    // Betting
    async getBetProviders(): Promise<RedBillerResponse> {
        return await this.doRequest("GET", "/1.5/bills/betting/providers/list");
    }

    async creditBetWallet(
        product: string,
        customerId: string,
        amount: string,
        phoneNo: string,
        callbackUrl: string,
        reference: string,
    ): Promise<RedBillerResponse> {
        return await this.doRequest("POST", "/1.5/bills/betting/account/payment/create", {
            product,
            customer_id: customerId,
            amount,
            phone_no: phoneNo,
            callback_url: callbackUrl,
            reference,
        });
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
