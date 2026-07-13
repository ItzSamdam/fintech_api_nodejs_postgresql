import z from "zod";

export const EnquiryAccountRequestSchema = z.object({
    accountNumber: z.string()
        .length(10, 'Account number must be exactly 10 digits')
        .regex(/^\d+$/, 'Account number must contain only digits'),
    bankCode: z.string()
        .length(6, 'Bank code must be exactly 6 characters')
        .optional()
        .default('NGN'),
});

export const TransferRequestSchema = z.object({
    recipientType: z.enum(["bank", "wallet"]),
    narration: z.string().min(1, 'Narration is required'),
    recipientId: z.string(),
    recipientBankCode: z.string(),
    // amount: z.
});