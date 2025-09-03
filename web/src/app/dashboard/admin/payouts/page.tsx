"use client";
import { useEffect, useState } from "react";
import { adminListPayouts, adminSetPayoutStatus, type AdminPayout } from "@/api/affiliates-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function formatRON(minor: number) {
  return `RON ${(minor / 100).toFixed(2)}`;
}

export default function AdminPayoutsPage() {
  const [items, setItems] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListPayouts({});
      setItems(res.items);
    } catch (e) {
      toast.error("Nu s-au putut încărca plățile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (id: string, status: "SENT" | "FAILED") => {
    setUpdatingId(id);
    try {
      const p = proofUrl[id]?.trim() || undefined;
      await adminSetPayoutStatus(id, status, p);
      toast.success("Actualizat");
      await load();
    } catch (e) {
      toast.error("Eroare la actualizare");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin: Cereri de payout afiliați</h2>
        <Button variant="outline" onClick={() => load()} disabled={loading}>
          Reîncarcă
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista cererilor</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Se încarcă…</div>
          ) : items.length === 0 ? (
            <div>Nu există cereri.</div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="p-3 border rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatRON(p.amount)}</span>
                      <Badge
                        variant="secondary"
                        className={
                          p.status === "REQUESTED"
                            ? "bg-amber-100 text-amber-700 border-0"
                            : p.status === "SENT"
                            ? "bg-emerald-100 text-emerald-700 border-0"
                            : "bg-rose-100 text-rose-700 border-0"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      <div>Solicitat: {new Date(p.requestedAt).toLocaleString()}</div>
                      {p.sentAt ? <div>Trimis: {new Date(p.sentAt).toLocaleString()}</div> : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Affiliate user</div>
                      <div className="font-mono">{p.affiliateUserId}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-slate-500">Detalii bancare</div>
                      <div className="whitespace-pre-wrap break-words bg-slate-50 p-2 rounded border text-slate-800">
                        {p.bankDetails || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <Input
                      placeholder="Link dovadă plată (opțional)"
                      value={proofUrl[p.id] ?? ""}
                      onChange={(e) => setProofUrl((s) => ({ ...s, [p.id]: e.target.value }))}
                      className="md:max-w-md"
                      disabled={updatingId === p.id}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setStatus(p.id, "SENT")}
                        disabled={updatingId === p.id}
                        className="paylink-button-primary"
                      >
                        Marchează plătit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setStatus(p.id, "FAILED")}
                        disabled={updatingId === p.id}
                      >
                        Marchează eșuat
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
