import { api, getToken } from "@/lib/api";
import useSWR from "swr";

type User = { id: string; email: string; role: "USER" | "ADMIN" };

const fetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data as { user: User; onboarded?: boolean };
};

export const useAuth = () => {
  const hasToken = typeof window !== "undefined" && !!getToken();
  const { data, error, isLoading, mutate } = useSWR(
    hasToken ? "/v1/me" : null,
    fetcher,
    { shouldRetryOnError: false }
  );

  return {
    user: data?.user ?? null,
    isAuthenticated: !!data?.user,
    onboarded: !!data?.onboarded,
    isLoading,
    error: error as Error | undefined,
    refresh: () => mutate(),
  };
};
