import {
  listTransactions,
  type TransactionsListResponse,
} from "@/api/transactions";
import useSWR from "swr";

export function useTransactions(status: string) {
  const key = ["/v1/transactions", status] as const;
  const { data, error, isLoading, mutate } = useSWR<TransactionsListResponse>(
    key,
    () => listTransactions({ status })
  );
  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
