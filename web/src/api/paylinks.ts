import { api } from "@/lib/api";

export type PayLink = {
  id: string;
  name: string;
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number | null; // RON
  minAmount?: number | null; // RON
  currency: string;
  active: boolean;
  serviceType: "SERVICE" | "DIGITAL_PRODUCT" | "DONATION" | "FUNDRAISING";
  description?: string | null;
  collectEmail: boolean;
  collectPhone: boolean;
  collectBillingAddress?: boolean | null;
  addVat?: boolean | null;
  mainColor?: string | null;
  service?: {
    id: string;
    title: string;
    description?: string | null;
    coverImageUrl?: string | null;
  } | null;
  product?: {
    id: string;
    name: string;
    description?: string | null;
    assets?: unknown;
    coverImageUrl?: string | null;
  } | null;
  fundraising?: {
    id: string;
    targetAmount?: number | null;
    currentRaised?: number | null;
    coverImageUrl?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdatePayLinkInput = Partial<{
  name: string;
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number; // RON
  minAmount?: number; // RON
  serviceType: "SERVICE" | "DIGITAL_PRODUCT" | "DONATION" | "FUNDRAISING";
  description?: string;
  active?: boolean;
  collectEmail?: boolean;
  collectPhone?: boolean;
  collectBillingAddress?: boolean;
  addVat?: boolean;
  mainColor?: string;
  service?: { title?: string; description?: string; coverImageUrl?: string };
  product?: {
    name?: string;
    description?: string;
    assets?: unknown;
    coverImageUrl?: string;
  };
  fundraising?: { targetAmount?: number; coverImageUrl?: string };
}>;

export async function listPayLinks() {
  const { data } = await api.get<{ items: PayLink[] }>("/v1/paylinks");
  return data.items;
}

export async function createPayLink(input: {
  name: string;
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number; // RON
  minAmount?: number; // RON
  serviceType: "SERVICE" | "DIGITAL_PRODUCT" | "DONATION" | "FUNDRAISING";
  description?: string;
  collectEmail?: boolean;
  collectPhone?: boolean;
  collectBillingAddress?: boolean;
  addVat?: boolean;
  mainColor?: string;
  service?: { title: string; description?: string; coverImageUrl?: string };
  product?: {
    name: string;
    description?: string;
    assets?: unknown;
    coverImageUrl?: string;
  };
  fundraising?: {
    targetAmount?: number;
    coverImageUrl?: string;
  };
}) {
  const { data } = await api.post<PayLink>("/v1/paylinks", input);
  return data;
}

export async function updatePayLink(id: string, input: UpdatePayLinkInput) {
  const { data } = await api.patch<PayLink>(`/v1/paylinks/${id}`, input);
  return data;
}

export async function deletePayLink(id: string) {
  await api.delete(`/v1/paylinks/${id}`);
}

export async function duplicatePayLink(id: string) {
  const { data } = await api.post<PayLink>(`/v1/paylinks/${id}/duplicate`, {});
  return data;
}
