"use client";
import { presignDownload } from "@/api/purchases";
import { Button } from "@/components/ui/button";
import { usePurchases } from "@/hooks/use-purchases";
import Image from "next/image";
import { useState } from "react";

export default function PurchasesPage() {
  const { items, isLoading, error } = usePurchases();
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  if (isLoading) return <div className="p-6">Se încarcă...</div>;
  if (error)
    return <div className="p-6 text-red-600">Eroare la încărcare.</div>;
  if (!items.length)
    return (
      <div className="p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          {/* Simple receipt-like icon using emoji or fallback; could replace with lucide icon */}
          <span className="text-slate-400 text-xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Nu aveți achiziții încă
        </h3>
        <p className="text-sm text-slate-500">
          Produsele digitale cumpărate vor apărea aici după plată.
        </p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {it.productCoverImageUrl ? (
                  <Image
                    src={it.productCoverImageUrl}
                    alt={it.productName || it.payLinkName}
                    width={64}
                    height={64}
                    className="rounded object-cover flex-shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="font-medium flex items-center gap-2 truncate">
                    {it.payLinkName}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {it.serviceType === "SERVICE"
                        ? "Serviciu"
                        : "Produs digital"}
                    </span>
                  </div>
                  {it.productName ? (
                    <div className="text-sm text-muted-foreground truncate">
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
            </div>
            {it.serviceType !== "SERVICE" && it.assets?.length ? (
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
                {it.serviceType === "SERVICE"
                  ? "Acest serviciu nu are fișiere de descărcat."
                  : "Fără fișiere atașate."}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
