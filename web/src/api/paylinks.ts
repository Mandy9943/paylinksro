import { api } from "@/lib/api";

export type PayLink = {
  id: string;
  name: string;
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number | null; // RON
  currency: string;
  active: boolean;
  serviceType: "SERVICE" | "DIGITAL_PRODUCT" | "DONATION";
  description?: string | null;
  collectEmail: boolean;
  collectPhone: boolean;
  mainColor?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listPayLinks() {
  const { data } = await api.get<{ items: PayLink[] }>("/v1/paylinks");
  return data.items;
}

export async function createPayLink(input: {
  name: string;
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number; // RON
  serviceType: "SERVICE" | "DIGITAL_PRODUCT" | "DONATION";
  description?: string;
  collectEmail?: boolean;
  collectPhone?: boolean;
  mainColor?: string;
  service?: { title: string; description?: string };
  product?: {
    name: string;
    description?: string;
    assets?: unknown;
    coverImageUrl?: string;
  };
}) {
  const { data } = await api.post<PayLink>("/v1/paylinks", input);
  return data;
}

export async function updatePayLink(id: string, input: Partial<PayLink>) {
  const { data } = await api.patch<PayLink>(`/v1/paylinks/${id}`, input);
  return data;
}

export async function deletePayLink(id: string) {
  await api.delete(`/v1/paylinks/${id}`);
}
