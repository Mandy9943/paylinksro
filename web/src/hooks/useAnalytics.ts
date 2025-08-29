"use client";
import { api } from "@/lib/api";
import useSWR, { mutate as swrMutate } from "swr";
import useSWRMutation from "swr/mutation";

export function useAnalyticsSummary(params?: { from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const key = `/v1/analytics/summary${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return useSWR(key, async () => {
    const { data } = await api.get(key);
    return data.summary as {
      revenueGrossMinor: number;
      revenueNetMinor: number | null;
      refundedMinor: number;
      successCount: number;
      disputesCount: number;
      newCustomers: number;
      avgProcessingMs: number | null;
    };
  });
}

export function useRevenueSeries(params?: {
  from?: string;
  to?: string;
  interval?: "day" | "month";
}) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.interval) qs.set("interval", params.interval);
  const key = `/v1/analytics/revenue${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return useSWR(key, async () => {
    const { data } = await api.get(key);
    return data.series as Array<{ bucket: string; amountMinor: number }>;
  });
}

export function usePaymentMethods(params?: { from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const key = `/v1/analytics/payment-methods${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return useSWR(key, async () => {
    const { data } = await api.get(key);
    return data.items as Array<{ brand: string; count: number; pct: number }>;
  });
}

export function useBalance() {
  const key = `/v1/stripe/balance`;
  return useSWR(key, async () => {
    const { data } = await api.get(key);
    return data as {
      currency: string;
      available: number;
      pending: number;
      totalTransferred: number;
    };
  });
}

export function useRefreshAnalytics() {
  const keys = [
    `/v1/analytics/summary`,
    `/v1/analytics/revenue`,
    `/v1/analytics/payment-methods`,
  ];
  const { trigger, isMutating } = useSWRMutation(
    `/v1/analytics/reconcile`,
    async (url: string) => {
      await api.post(url);
      // Revalidate known analytics caches
      await Promise.all(keys.map((k) => swrMutate(k)));
    }
  );
  return { refresh: () => trigger(), isRefreshing: isMutating };
}
