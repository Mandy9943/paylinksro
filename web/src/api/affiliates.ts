import { api } from "@/lib/api";

export type AffiliateSummary = {
  code: string | null;
  totals: {
    pending: number;
    available: number;
    allocated: number;
    paid: number;
    lifetimeEarned: number;
    referrals: number;
  };
  recent: {
    commissions: {
      id: string;
      amount: number;
      status: string;
      createdAt: string;
      referred: { id: string; email: string | null };
    }[];
    referrals: {
      id: string;
      createdAt: string;
      referred: { id: string; email: string | null };
    }[];
  };
};

export async function getAffiliateSummary() {
  const res = await api.get("/v1/affiliates/me");
  return res.data as AffiliateSummary;
}

export async function requestPayoutAll() {
  const res = await api.post("/v1/affiliates/payouts/request", {});
  return res.data as { payoutId: string };
}

export async function requestPayoutAllWithDetails(bankDetails: string) {
  const res = await api.post("/v1/affiliates/payouts/request", { bankDetails });
  return res.data as { payoutId: string };
}
