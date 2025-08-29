import { api } from "@/lib/api";

export type CustomerListItem = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  updatedAt: string;
  totalAmount?: number; // minor units
  payments?: number;
};

export type CustomersListResponse = {
  items: CustomerListItem[];
  counts: Record<string, number | undefined>;
  nextCursor?: string;
};

export async function listCustomers(params?: {
  segment?: string;
  cursor?: string;
  limit?: number;
}): Promise<CustomersListResponse> {
  const { data } = await api.get<CustomersListResponse>("/v1/customers", {
    params,
  });
  return data;
}
