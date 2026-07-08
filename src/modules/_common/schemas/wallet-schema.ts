import { z } from 'zod';

// Create Wallet Request
export const CreateWalletRequestSchema = z.object({
    currency: z.string()
        .length(3, 'Currency must be exactly 3 characters')
        .optional()
        .default('NGN'),
});

export type CreateWalletRequest = z.infer<typeof CreateWalletRequestSchema>;

// Wallet Action Request
export const WalletActionRequestSchema = z.object({
    wallet_id: z.string()
        .min(1, 'Wallet ID is required'),
    reason: z.string()
        .optional(),
});

export type WalletActionRequest = z.infer<typeof WalletActionRequestSchema>;

// Get Transactions Request (query parameters)
export const GetTransactionsRequestSchema = z.object({
    page: z.coerce.number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .optional()
        .default(1),
    limit: z.coerce.number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .optional()
        .default(20),
    category: z.string()
        .optional(),
    status: z.string()
        .optional(),
    from_date: z.string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return !isNaN(Date.parse(val));
        }, 'Invalid date format'),
    to_date: z.string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return !isNaN(Date.parse(val));
        }, 'Invalid date format'),
});

export type GetTransactionsRequest = z.infer<typeof GetTransactionsRequestSchema>;

// Get Statement Request (query parameters)
export const GetStatementRequestSchema = z.object({
    from_date: z.string()
        .min(1, 'From date is required')
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid from date format'),
    to_date: z.string()
        .min(1, 'To date is required')
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid to date format'),
    format: z.enum(['pdf', 'csv'])
        .optional()
        .default('pdf'),
});

export type GetStatementRequest = z.infer<typeof GetStatementRequestSchema>;