"use client";
import type { PayLink } from "@/api/paylinks";
import { api } from "@/lib/api";
import useSWR from "swr";

const KEY = "/v1/paylinks";

async function fetchPayLinks(): Promise<PayLink[]> {
  const { data } = await api.get<{ items: PayLink[] }>(KEY);
  return data.items;
}

export function usePayLinks() {
  const { data, error, isLoading, mutate } = useSWR<PayLink[]>(
    KEY,
    fetchPayLinks,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    items: data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
    refresh: () => mutate(),
  } as const;
}
