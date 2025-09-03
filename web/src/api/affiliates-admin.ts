import { api } from "@/lib/api";

export type AdminPayout = {
  id: string;
  amount: number;
  status: "REQUESTED" | "SENT" | "FAILED";
  requestedAt: string;
  sentAt?: string | null;
  affiliateUserId: string;
  bankDetails?: string | null;
  proofUrl?: string | null;
};

export async function adminListPayouts(params?: { status?: string; affiliateId?: string; cursor?: string; limit?: number }) {
  const res = await api.get("/v1/affiliates/admin/payouts", { params });
  return res.data as { items: AdminPayout[] };
}

export async function adminSetPayoutStatus(id: string, status: "SENT" | "FAILED", proofUrl?: string) {
  const res = await api.patch(`/v1/affiliates/admin/payouts/${id}`, { status, proofUrl });
  return res.data as { ok: true };
}
