import { api } from "@/lib/api";

export type TransactionItem = {
  id: string;
  amount: number; // minor units to RON conversion handled in UI
  currency: string;
  status:
    | "SUCCEEDED"
    | "FAILED"
    | "REFUNDED"
    | "PENDING"
    | "UNCAPTURED"
    | "DISPUTED"
    | "REQUIRES_ACTION";
  paymentMethodType?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  description?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  customer?: { email?: string | null } | null;
};

export type TransactionsListResponse = {
  items: TransactionItem[];
  counts: Record<string, number>;
  nextCursor?: string;
};

export async function listTransactions(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<TransactionsListResponse> {
  const { data } = await api.get<TransactionsListResponse>("/v1/transactions", {
    params,
  });
  return data;
}
