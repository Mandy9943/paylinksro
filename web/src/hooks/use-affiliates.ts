"use client";
import {
  getAffiliateSummary,
  requestPayoutAll,
  type AffiliateSummary,
} from "@/api/affiliates";
import useSWR from "swr";

export function useAffiliateSummary() {
  const { data, error, isLoading, mutate } = useSWR<AffiliateSummary>(
    "/v1/affiliates/me",
    () => getAffiliateSummary()
  );
  return { data, error, isLoading, refresh: mutate };
}

export async function withdrawAllAvailable() {
  return await requestPayoutAll();
}
