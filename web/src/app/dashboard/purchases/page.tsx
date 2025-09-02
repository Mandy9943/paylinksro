"use client";
import { presignDownload } from "@/api/purchases";
import { Button } from "@/components/ui/button";
import { usePurchases } from "@/hooks/use-purchases";
import { useState } from "react";
import Image from "next/image";

export default function PurchasesPage() {
  const { items, isLoading, error } = usePurchases();
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  if (isLoading) return <div className="p-6">Se încarcă...</div>;
  if (error)
    return <div className="p-6 text-red-600">Eroare la încărcare.</div>;
  if (!items.length) return <div className="p-6">Nu aveți achiziții încă.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Achizițiile mele</h1>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                {it.productCoverImageUrl ? (
                  <Image
                    src={it.productCoverImageUrl}
                    alt={it.productName || it.payLinkName}
                    width={64}
                    height={64}
                    className="rounded object-cover"
                  />
                ) : null}
                <div className="font-medium">{it.payLinkName}</div>
                {it.productName ? (
                  <div className="text-sm text-muted-foreground">
                    {it.productName}
                  </div>
                ) : null}
                {it.succeededAt ? (
                  <div className="text-xs text-muted-foreground">
                    {new Date(it.succeededAt).toLocaleString()}
                  </div>
                ) : null}
              </div>
            </div>
            {it.assets?.length ? (
              <ul className="mt-3 space-y-2">
                {it.assets.map((a) => (
                  <li key={a.key} className="flex items-center justify-between">
                    <span className="truncate mr-2">
                      {a.name || a.key.split("/").pop() || a.key}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={downloadingKey === a.key}
                      onClick={async () => {
                        setDownloadingKey(a.key);
                        try {
                          const { url } = await presignDownload(
                            it.payLinkId,
                            a.key
                          );
                          window.open(url, "_blank");
                        } finally {
                          setDownloadingKey(null);
                        }
                      }}
                    >
                      Descarcă
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground mt-2">
                Fără fișiere atașate.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
