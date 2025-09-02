import { fetchPurchases, type PurchaseItem } from "@/api/purchases";
import useSWR from "swr";

export function usePurchases() {
  const { data, error, isLoading, mutate } = useSWR<PurchaseItem[]>(
    "/v1/purchases",
    async () => await fetchPurchases()
  );
  return { items: data || [], error, isLoading, mutate };
}
