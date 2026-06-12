import axios, { type AxiosInstance } from "axios";

export interface TermiiSMSResponse {
    message_id: string;
    message: string;
    balance: string;
    user: string;
}

export class TermiiClient {
    private readonly http: AxiosInstance;

    constructor(private readonly apiKey: string) {
        this.http = axios.create({
            baseURL: "https://api.ng.termii.com/api",
            timeout: 30000,
            headers: { "Content-Type": "application/json" },
        });
    }

    async sendSMS(phone: string, otp: string, body: string, expireMinutes: number): Promise<TermiiSMSResponse> {
        const message =
            body ||
            `Your Fintech authentication code is ${otp}. Valid for ${expireMinutes} minutes, one-time use only`;

        const reqBody = {
            api_key: this.apiKey,
            to: phone,
            from: "FintechApp",
            sms: message,
            type: "plain",
            channel: "dnd",
        };

        const resp = await this.http.post("/sms/send", reqBody);
        if (!resp.data.message_id) {
            throw new Error(`SMS sending failed: ${resp.data.message}`);
        }
        return resp.data;
    }

    async sendOTP(phone: string, otp: string, expireMinutes: number): Promise<TermiiSMSResponse> {
        return await this.sendSMS(phone, otp, "", expireMinutes);
    }

    async sendCustomSMS(phone: string, message: string): Promise<TermiiSMSResponse> {
        const reqBody = {
            api_key: this.apiKey,
            to: phone,
            from: "FintechApp",
            sms: message,
            type: "plain",
            channel: "dnd",
        };
        const resp = await this.http.post("/sms/send", reqBody);
        if (!resp.data.message_id) {
            throw new Error(`SMS sending failed: ${resp.data.message}`);
        }
        return resp.data;
    }
}

// Async SMS Service
export interface SMSPayload {
    phone: string;
    otp: string;
    body: string;
    expireMinutes: number;
}

export class SMSService {
    private readonly smsQueue: SMSPayload[] = [];
    private processing = false;

    constructor(private readonly termiiClient: TermiiClient) { }

    private async processQueue(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        while (this.smsQueue.length > 0) {
            const payload = this.smsQueue.shift();
            if (!payload) break; // guard against undefined without using non-null assertion
            try {
                await this.termiiClient.sendSMS(payload.phone, payload.otp, payload.body, payload.expireMinutes);
            } catch (err) {
                console.error(`Failed to send SMS to ${payload.phone}:`, err);
            }
        }

        this.processing = false;
    }

    sendAsync(phone: string, otp: string, body: string, expireMinutes: number): void {
        this.smsQueue.push({ phone, otp, body, expireMinutes });
        void this.processQueue();
    }

    async sendSync(phone: string, otp: string, body: string, expireMinutes: number): Promise<TermiiSMSResponse> {
        return await this.termiiClient.sendSMS(phone, otp, body, expireMinutes);
    }
}
