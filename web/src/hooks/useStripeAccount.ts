"use client";
import { api } from "@/lib/api";
import { useCallback } from "react";
import useSWR from "swr";

const ACCOUNT_KEY = "stripeAccountId"; // kept for temporary caching, but source of truth is server

export type StripeAccount = {
  id: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
};

async function getAccount(accountId: string): Promise<StripeAccount> {
  const { data } = await api.get(`/v1/stripe/accounts/${accountId}`);
  return data.account as StripeAccount;
}

async function ensureServerAccount(): Promise<{
  id: string;
  account: StripeAccount;
}> {
  const { data } = await api.get(`/v1/stripe/accounts/me`);
  return { id: data.id as string, account: data.account as StripeAccount };
}

export function useStripeAccount() {
  const ensure = useCallback(async () => {
    const { id } = await ensureServerAccount();
    if (typeof window !== "undefined") localStorage.setItem(ACCOUNT_KEY, id);
    return id;
  }, []);

  const fetcher = async () => {
    const id = await ensure();
    return getAccount(id);
  };

  const { data, error, isLoading, mutate } = useSWR(
    "/stripe/account/me",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  const account = data ?? null;

  const isOnboarded = !!(
    account &&
    (account.details_submitted || account.charges_enabled)
  );

  const getAccountId = () =>
    (typeof window !== "undefined"
      ? localStorage.getItem(ACCOUNT_KEY)
      : null) ?? null;

  return {
    account,
    isOnboarded,
    isLoading,
    error: error as Error | undefined,
    refresh,
    getAccountId,
  };
}
