// Centralized fee configuration and helpers

export const FEES = {
  MIN_TRANSACTION_RON: 5, // Minimum allowed amount per transaction/link
  PERCENT_FEE: 0.05, // 5%
  FIXED_FEE_LOW_RON: 1, // +1 RON for small transactions
  FIXED_FEE_HIGH_RON: 2, // +2 RON for larger transactions
  FIXED_FEE_THRESHOLD_RON: 10, // <= 10 RON => +1, > 10 RON => +2
  MONTHLY_ACTIVE_FEE_RON: 10, // monthly platform fee when active that month
} as const;

export const BANI = {
  fromRON(ron?: number | null): number | undefined {
    if (ron == null) return undefined;
    return Math.round(ron * 100);
  },
  toRON(bani?: number | null): number | null {
    if (bani == null) return null;
    return bani / 100;
  },
};

export function monthStartUTC(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

export function calcBaseApplicationFeeMinor(amountMinor: number): number {
  const percent = Math.floor(amountMinor * FEES.PERCENT_FEE);
  const isLow = amountMinor <= FEES.FIXED_FEE_THRESHOLD_RON * 100;
  const fixed =
    (isLow ? FEES.FIXED_FEE_LOW_RON : FEES.FIXED_FEE_HIGH_RON) * 100;
  return Math.max(0, percent + fixed);
}

export function splitBaseApplicationFeeMinor(amountMinor: number): {
  percentMinor: number;
  fixedMinor: number;
} {
  const percentMinor = Math.floor(amountMinor * FEES.PERCENT_FEE);
  const isLow = amountMinor <= FEES.FIXED_FEE_THRESHOLD_RON * 100;
  const fixedMinor =
    (isLow ? FEES.FIXED_FEE_LOW_RON : FEES.FIXED_FEE_HIGH_RON) * 100;
  return { percentMinor, fixedMinor };
}

export function minTransactionMinor(): number {
  return FEES.MIN_TRANSACTION_RON * 100;
}

export function monthlyFeeMinor(): number {
  return FEES.MONTHLY_ACTIVE_FEE_RON * 100;
}
