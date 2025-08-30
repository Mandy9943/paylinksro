"use client";
import { api } from "@/lib/api";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export type PayoutItem = {
  id: string;
  amountMinor: number;
  currency: string;
  status: string;
  created: string | null;
  arrivalDate: string | null;
  method: string | null;
  statementDescriptor: string | null;
};

export function usePayouts(params?: { limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  const key = `/v1/stripe/payouts${qs.toString() ? `?${qs.toString()}` : ""}`;
  return useSWR<PayoutItem[]>(key, async () => {
    const { data } = await api.get(key);
    const items = (data.items ?? []) as Array<{
      id: string;
      amountMinor: number;
      currency: string;
      status: string;
      created: string | null;
      arrivalDate: string | null;
      method: string | null;
      statementDescriptor: string | null;
    }>;
    return items.map((p) => ({
      ...p,
      created: p.created ? new Date(p.created).toISOString() : null,
      arrivalDate: p.arrivalDate ? new Date(p.arrivalDate).toISOString() : null,
    }));
  });
}

export function useRequestPayout() {
  const { trigger, isMutating } = useSWRMutation(
    `/v1/stripe/payouts`,
    async (
      url: string,
      { arg }: { arg?: { currency?: string; statementDescriptor?: string } }
    ) => {
      const { data } = await api.post(url, arg ?? {});
      return data;
    }
  );
  return { request: trigger, isRequesting: isMutating };
}
