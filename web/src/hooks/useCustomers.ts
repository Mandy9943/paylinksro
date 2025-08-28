import { listCustomers, type CustomersListResponse } from "@/api/customers";
import useSWR from "swr";

export function useCustomers(segment: string) {
  const key = ["/v1/customers", segment] as const;
  const { data, error, isLoading, mutate } = useSWR<CustomersListResponse>(
    key,
    () => listCustomers({ segment })
  );
  return { data, error, isLoading, mutate };
}
