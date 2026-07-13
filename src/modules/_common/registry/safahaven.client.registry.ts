import axios, { type AxiosError, type AxiosInstance } from 'axios';
import {config} from "@/shared/config";

// ---------- Interfaces ----------
export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
}

export interface INameEnquiryPayload {
  bankCode: string;
  accountNumber: string;
}

export interface ITransferPayload {
  nameEnquiryReference: string;
  debitAccountNumber: string;
  beneficiaryBankCode: string;
  beneficiaryAccountNumber: string;
  amount: number;
  saveBeneficiary: boolean;
  narration?: string;
  paymentReference?: string;
}

export interface IBillPayload {
  debitAccountNumber: string;
  amount: number;
  channel?: 'WEB' | 'POS' | 'ATM';
  externalReference?: string;
  [key: string]: any;
}

export interface IBillVerifyPayload {
  serviceCategoryId: string;
  entityNumber: string;
}

export interface ICreateVirtualAccountPayload {
  callbackUrl: string;
  validFor?: number;
  amountControl?: 'Fixed' | 'UnderPayment' | 'OverPayment';
  amount?: number;
  externalReference?: string;
  settlementAccount?: Record<string, unknown>;
}

// ---------- Axios Setup ----------
const BaseEndpoint =
  config.serverEnv === 'production'
    ? 'https://api.safehavenmfb.com'
    : 'https://api.safehavenmfb.com';

// Main client — all authenticated requests go through here
const axiosCustom: AxiosInstance = axios.create({
  baseURL: BaseEndpoint,
  timeout: 30000,
});

// Interceptor-free client — only used for the token request to avoid
// an infinite loop where the interceptor tries to auth before the token exists
const axiosAuth: AxiosInstance = axios.create({
  baseURL: BaseEndpoint,
  timeout: 30000,
});

const handleError = (error: unknown): IApiResponse<any> => {
  // Handle plain errors thrown by the interceptor (e.g. 'Authorization failed')
  if (!(error as AxiosError).isAxiosError) {
    const plainError = error as Error;
    console.error('Safe Haven Non-Axios Error:', plainError.message);
    return {
      success: false,
      message:
        plainError.message || 'Request cannot be processed at the moment',
      data: null,
    };
  }

  const axiosError = error as AxiosError;
  console.error(
    'Safe Haven API Error:',
    axiosError.response?.data || axiosError.message,
  );
  return {
    success: false,
    message:
      (axiosError.response?.data as any)?.message ||
      axiosError.message ||
      'Request cannot be processed at the moment',
    data: null,
  };
};

// ---------- SafeHavenApi (token handling) ----------
export const SafeHavenDefaultApi = {
  cachedToken: null as string | null,
  tokenExpiry: 0,
  authorizingPromise: null as Promise<IApiResponse<string>> | null,

  authorizeAPI: async (): Promise<IApiResponse<string>> => {
    const now = Date.now();

    console.log(
      `[SafeHaven] ${SafeHavenDefaultApi.cachedToken && Date.now() < SafeHavenDefaultApi.tokenExpiry ? 'Reusing cached token' : 'Fetching new token'}`,
    );

    // Return cached token if still valid
    if (SafeHavenDefaultApi.cachedToken && now < SafeHavenDefaultApi.tokenExpiry) {
      return { success: true, data: SafeHavenDefaultApi.cachedToken };
    }

    // Reuse in-flight token request if one is already running
    if (SafeHavenDefaultApi.authorizingPromise) {
      return await SafeHavenDefaultApi.authorizingPromise;
    }

    SafeHavenDefaultApi.authorizingPromise = (async () => {
      try {
        // ✅ SafeHaven uses application/x-www-form-urlencoded for token requests
        // Ref: https://safehavenmfb.readme.io/reference/oauth2token
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', config.safeHavenMb.clientId);
        params.append(
          'client_assertion',
          config.safeHavenMb.clientAssertion,
        );
        params.append(
          'client_assertion_type',
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        );

        const response = await axiosAuth.post('/oauth2/token', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const { access_token: accessToken, expires_in: expiresIn } =
          response.data;

        if (!accessToken) {
          throw new Error('No access_token returned from SafeHaven');
        }

        SafeHavenDefaultApi.cachedToken = accessToken;
        // Subtract 60s to refresh before actual expiry
        SafeHavenDefaultApi.tokenExpiry = Date.now() + (expiresIn - 30) * 1000;

        console.log(
          'SafeHaven token acquired, expires in',
          expiresIn,
          'seconds',
        );
        return { success: true, data: accessToken };
      } catch (error) {
        const axiosError = error as AxiosError;
        // Log the raw response so you can see exactly what SafeHaven rejected
        console.error(
          'SafeHaven token fetch failed:',
          axiosError.response?.data || (error as Error).message,
        );

        SafeHavenDefaultApi.cachedToken = null;
        SafeHavenDefaultApi.tokenExpiry = 0;
        return handleError(error) as IApiResponse<string>;
      } finally {
        SafeHavenDefaultApi.authorizingPromise = null;
      }
    })();

    return await SafeHavenDefaultApi.authorizingPromise;
  },
};

// ---------- Interceptor to auto-authorize ----------
axiosCustom.interceptors.request.use(async requestConfig => {
  const authResponse = await SafeHavenDefaultApi.authorizeAPI();

  if (!authResponse.success || !authResponse.data) {
    // ✅ Throw an AxiosError-compatible object so handleError can process it
    // properly downstream instead of a plain Error that gets swallowed
    const err = new Error(
      authResponse.message ?? 'Authorization failed',
    ) as any;
    err.isAxiosError = false; // signals handleError to treat as plain error
    throw err;
  }

  // ✅ SafeHaven requires both Authorization and ClientID headers on every request
  // Ref: https://safehavenmfb.readme.io/reference/getting-started
  requestConfig.headers.set('Authorization', `Bearer ${authResponse.data}`);
  requestConfig.headers.set('ClientID', config.safeHavenMb.clientId);

  return requestConfig;
});

// Automatic retry on 401/403 — e.g. token was revoked mid-session
axiosCustom.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    const status = error.response?.status;

    if (
      status !== undefined &&
      [401, 403].includes(status) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Force token refresh
      SafeHavenDefaultApi.cachedToken = null;
      SafeHavenDefaultApi.tokenExpiry = 0;

      const authResponse = await SafeHavenDefaultApi.authorizeAPI();
      if (authResponse.success && authResponse.data) {
        originalRequest.headers.Authorization = `Bearer ${authResponse.data}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await axiosCustom(originalRequest);
      }
    }

    throw error;
  },
);

// ---------- API Methods ----------
export const SafeHavenApi = {
  // ACCOUNTS
  getAccounts: async (
    isSubAccount = false,
    page = 0,
    limit = 100,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(`/accounts`, {
        params: { page, limit, isSubAccount },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getAccount: async (accountId: string): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(`/accounts/${accountId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // BANKS
  fetchBanks: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(`/transfers/banks`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // ACCOUNT VERIFICATION
  verifyAccountDetails: async (
    payload: INameEnquiryPayload,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/transfers/name-enquiry`, {
        bankCode: payload.bankCode,
        accountNumber: payload.accountNumber,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // TRANSFERS
  sendMoney: async (payload: ITransferPayload): Promise<IApiResponse<any>> => {
    if (!payload.amount || payload.amount <= 0) {
      return {
        success: false,
        message: 'Amount must be greater than zero',
        data: null,
      };
    }
    try {
      const response = await axiosCustom.post(`/transfers`, {
        nameEnquiryReference: payload.nameEnquiryReference,
        debitAccountNumber: payload.debitAccountNumber,
        beneficiaryBankCode: payload.beneficiaryBankCode,
        beneficiaryAccountNumber: payload.beneficiaryAccountNumber,
        amount: payload.amount,
        saveBeneficiary: payload.saveBeneficiary,
        narration: payload.narration,
        paymentReference: payload.paymentReference,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getTransferStatus: async (
    sessionId?: string,
    paymentReference?: string,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/transfers/status`, {
        sessionId,
        paymentReference,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getVASStatus: async (extReference: string): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/transaction/${extReference}`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // VIRTUAL ACCOUNTS
  createVirtualAccount: async (
    payload: ICreateVirtualAccountPayload,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/virtual-accounts`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getVirtualAccount: async (accountId: string): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(`/virtual-accounts/${accountId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  verifyVirtualAccountPayment: async (
    sessionId: string,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/virtual-accounts/status`, {
        sessionId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // VAS (Bills)
  getServices: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(`/vas/services`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  verifyCableOrDisco: async (
    payload: IBillVerifyPayload,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`vas/verify`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getServiceCategories: async (
    serviceId: string,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service/${serviceId}/service-categories`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getUtilities: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service/61efab78b5ce7eaad3b405d0/service-categories`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getAirtimeBundles: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service/61efaba1da92348f9dde5f6c/service-categories`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getDataBundles: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service/61efabb2da92348f9dde5f6e/service-categories`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getCableTVBundles: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service/61efabbeda92348f9dde5f70/service-categories`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getUtilityProducts: async (productId: string): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service-category/${productId}/products`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getCableProducts: async (productId: string): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service-category/${productId}/products`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getCategoryProducts: async (
    categoryId: string,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/service-category/${categoryId}/products`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  verifyBillCustomer: async (
    payload: IBillPayload,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/vas/verify`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  purchaseAirtime: async (
    payload: IBillPayload,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/vas/pay/airtime`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  purchaseData: async (payload: IBillPayload): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/vas/pay/data`, payload);
      console.log(response, 'api-call');
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  purchaseCable: async (payload: IBillPayload): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/vas/pay/cable-tv`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  purchaseUtility: async (
    payload: IBillPayload,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`/vas/pay/utility`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getVasTransaction: async (
    idOrExternalReference: string,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `/vas/transaction/${idOrExternalReference}`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  verifyTransaction: async (
    sessionId?: string,
    reference?: string,
  ): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.post(`transfers/status`, {
        sessionId,
        paymentReference: reference,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  getAccountBalance: async (): Promise<IApiResponse<any>> => {
    try {
      const response = await axiosCustom.get(
        `accounts/6a3141de573d4f0024167748`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },
};
