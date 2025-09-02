import { api } from "@/lib/api";

export type PurchaseItem = {
  id: string;
  payLinkId: string;
  payLinkName: string;
  sellerId: string;
  succeededAt: string | null;
  productName: string | null;
  productCoverImageUrl: string | null;
  assets: { key: string; name?: string | null }[];
};

export async function fetchPurchases(): Promise<PurchaseItem[]> {
  const res = await api.get("/v1/purchases");
  return res.data.items as PurchaseItem[];
}

export async function presignDownload(payLinkId: string, key: string) {
  const res = await api.post("/v1/purchases/presign", { payLinkId, key });
  return res.data as { url: string };
}
