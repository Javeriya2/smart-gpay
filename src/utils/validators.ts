import { z } from 'zod';

export const paymentPromptSchema = z.object({
  message: z
    .string()
    .min(3, { message: 'Payment prompt must be at least 3 characters long.' })
    .max(200, { message: 'Character limit is 200.' })
    .refine((val) => val.trim().length > 0, { message: 'Payment request cannot be empty.' }),
});

export const validateAmount = (amount: number, userBalance?: number): { isValid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero.' };
  }
  if (userBalance !== undefined && amount > userBalance) {
    return { isValid: false, error: `Insufficient balance. Available: ₹${userBalance}` };
  }
  return { isValid: true };
};
