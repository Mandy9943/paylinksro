"use client";
// NOTE: API not available yet; using local stubs to avoid build errors.
async function exportTransactionsCsv(_args: { status: string }) {
  void _args;
  return new Blob(["id,amount,currency,status\n"], { type: "text/csv" });
}
async function refundTransaction(_id: string) {
  void _id;
  return { ok: true } as const;
}
async function sendReceipt(_id: string) {
  void _id;
  return { ok: true } as const;
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Removed react-query. Using local state and direct calls instead.
import {
  CheckCircle,
  CreditCard,
  Download,
  MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type PaymentMethod = { type: string; brand: string; last4: string };
type TransactionRaw = {
  id: string;
  amount: number;
  currency?: string;
  status: "succeeded" | "failed" | "pending";
  paymentMethodType?: string;
  cardBrand?: string;
  cardLast4?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  customerEmail?: string;
  createdAt: string;
  receiptUrl?: string;
};
type TransactionDisplay = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: PaymentMethod;
  description: string;
  customer: string;
  date: string;
  refundedDate: string;
  declineReason: string;
  receiptUrl?: string;
  __raw: TransactionRaw;
};

function PaymentMethodIcon({ method }: { method: PaymentMethod }) {
  if (method.brand === "visa") {
    return (
      <div className="w-6 h-4 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
        VISA
      </div>
    );
  }
  if (method.brand === "mastercard") {
    return (
      <div className="w-6 h-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded">
        MC
      </div>
    );
  }
  if (method.brand === "amex") {
    return (
      <div className="w-6 h-4 bg-green-600 text-white text-xs font-bold flex items-center justify-center rounded">
        AX
      </div>
    );
  }
  return <CreditCard className="w-4 h-4 text-gray-400" />;
}

export default function Transactions() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    counts: Record<string, number>;
    items: TransactionRaw[];
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      // Mock items
      const base: TransactionRaw[] = [
        {
          id: "tx_1001",
          amount: 348.81,
          currency: "RON",
          status: "succeeded",
          paymentMethodType: "card",
          cardBrand: "visa",
          cardLast4: "4744",
          stripePaymentIntentId: "pi_1",
          customerEmail: "client1@example.com",
          createdAt: "2025-08-02T12:51:00.000Z",
          receiptUrl: "#",
        },
        {
          id: "tx_1002",
          amount: 174.41,
          currency: "RON",
          status: "succeeded",
          paymentMethodType: "card",
          cardBrand: "mastercard",
          cardLast4: "4366",
          stripePaymentIntentId: "pi_2",
          customerEmail: "client2@example.com",
          createdAt: "2025-08-01T21:13:00.000Z",
          receiptUrl: "#",
        },
        {
          id: "tx_1003",
          amount: 290.68,
          currency: "RON",
          status: "failed",
          paymentMethodType: "card",
          cardBrand: "amex",
          cardLast4: "1323",
          stripePaymentIntentId: "pi_3",
          customerEmail: "client3@example.com",
          createdAt: "2025-07-28T15:47:00.000Z",
          receiptUrl: "#",
        },
      ];
      const result = {
        counts: {
          all: base.length,
          succeeded: base.filter((t) => t.status === "succeeded").length,
          refunded: 0,
          disputed: 0,
          failed: base.filter((t) => t.status === "failed").length,
          uncaptured: 0,
        },
        items: base,
      };
      if (!cancelled) setData(result);
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const statusCounts = {
    all: data?.counts.all ?? 0,
    succeeded: data?.counts.succeeded ?? 0,
    refunded: data?.counts.refunded ?? 0,
    disputed: data?.counts.disputed ?? 0,
    failed: data?.counts.failed ?? 0,
    uncaptured: data?.counts.uncaptured ?? 0,
  };

  const items: TransactionDisplay[] = (data?.items ?? []).map(
    (t: TransactionRaw) => ({
      id: t.id,
      amount: new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: t.currency || "RON",
      }).format(t.amount || 0),
      currency: (t.currency || "RON").toUpperCase(),
      status:
        t.status === "succeeded"
          ? "Succeeded"
          : t.status === "failed"
          ? "Failed"
          : "Pending",
      paymentMethod: {
        type: t.paymentMethodType || "card",
        brand: t.cardBrand || "card",
        last4: t.cardLast4 || "0000",
      },
      description: t.stripePaymentIntentId || t.stripeChargeId || t.id,
      customer: t.customerEmail ?? "-",
      date: new Date(t.createdAt).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      refundedDate: "—",
      declineReason: "—",
      receiptUrl: t.receiptUrl,
      __raw: t,
    })
  );

  const filteredTransactions = items; // server does filtering

  const doExport = async () => {
    try {
      const blob = await exportTransactionsCsv({ status: statusFilter });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export nereușit");
    }
  };

  const refundMut = {
    isPending: false,
    mutateAsync: async (id: string) => {
      try {
        await refundTransaction(id);
        toast.success("Rambursare inițiată");
      } catch {
        toast.error("Eroare rambursare");
      }
    },
  } as const;

  const receiptMut = {
    isPending: false,
    mutateAsync: async (id: string) => {
      try {
        await sendReceipt(id);
        toast.success("Chitanță trimisă");
      } catch {
        toast.error("Eroare trimitere chitanță");
      }
    },
  } as const;

  const copyPaymentId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Copiat");
    } catch {
      toast.error("Nu s-a putut copia");
    }
  };

  const onViewDetails = (tx: TransactionDisplay) => {
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

  const onRefund = (tx: TransactionDisplay) => {
    setSelectedTx(tx);
    setRefundOpen(true);
  };

  const confirmRefund = async () => {
    if (!selectedTx) return;
    await refundMut.mutateAsync(selectedTx.__raw.id);
    setRefundOpen(false);
  };

  const onSendReceipt = async (tx: TransactionDisplay) => {
    await receiptMut.mutateAsync(tx.__raw.id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">
            Vizualizează și gestionează
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            Toate tranzacțiile
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={doExport}
            variant="outline"
            size="sm"
            className="gap-2 h-8 px-3 text-sm border-slate-200 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Exportă
          </Button>
        </div>
      </div>

      {/* Filters (no tabs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card
          className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
            statusFilter === "all"
              ? "ring-1 ring-blue-500 bg-blue-50/50"
              : "bg-white hover:bg-slate-50/50"
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Toate</div>
            <div className="text-lg font-semibold text-slate-900">
              {statusCounts.all}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
            statusFilter === "succeeded"
              ? "ring-1 ring-emerald-500 bg-emerald-50/50"
              : "bg-white hover:bg-slate-50/50"
          }`}
          onClick={() => setStatusFilter("succeeded")}
        >
          <CardContent className="p-3 text-center">
            <div className="text-xs text-emerald-600 mb-1">Reușite</div>
            <div className="text-lg font-semibold text-emerald-600">
              {statusCounts.succeeded}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
            statusFilter === "refunded"
              ? "ring-1 ring-amber-500 bg-amber-50/50"
              : "bg-white hover:bg-slate-50/50"
          }`}
          onClick={() => setStatusFilter("refunded")}
        >
          <CardContent className="p-3 text-center">
            <div className="text-xs text-amber-600 mb-1">Rambursate</div>
            <div className="text-lg font-semibold text-amber-600">
              {statusCounts.refunded}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
            statusFilter === "disputed"
              ? "ring-1 ring-orange-500 bg-orange-50/50"
              : "bg-white hover:bg-slate-50/50"
          }`}
          onClick={() => setStatusFilter("disputed")}
        >
          <CardContent className="p-3 text-center">
            <div className="text-xs text-orange-600 mb-1">Contestate</div>
            <div className="text-lg font-semibold text-orange-600">
              {statusCounts.disputed}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
            statusFilter === "failed"
              ? "ring-1 ring-red-500 bg-red-50/50"
              : "bg-white hover:bg-slate-50/50"
          }`}
          onClick={() => setStatusFilter("failed")}
        >
          <CardContent className="p-3 text-center">
            <div className="text-xs text-red-600 mb-1">Eșuate</div>
            <div className="text-lg font-semibold text-red-600">
              {statusCounts.failed}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
            statusFilter === "uncaptured"
              ? "ring-1 ring-slate-500 bg-slate-50/50"
              : "bg-white hover:bg-slate-50/50"
          }`}
          onClick={() => setStatusFilter("uncaptured")}
        >
          <CardContent className="p-3 text-center">
            <div className="text-xs text-slate-600 mb-1">Necapturate</div>
            <div className="text-lg font-semibold text-slate-600">
              {statusCounts.uncaptured}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">Se încarcă...</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-200/60">
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Sumă
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Metoda de plată
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Descriere
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Client
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Data
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Data rambursării
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Motiv respingere
                  </TableHead>
                  <TableHead className="w-[50px] py-3 px-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <TableRow
                    key={transaction.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/30 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                    }`}
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {transaction.amount}
                        </span>
                        <span className="text-xs text-slate-500 uppercase font-medium">
                          {transaction.currency}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 border-0 text-xs px-2 py-0.5"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Reușită</span>
                        </Badge>
                        <PaymentMethodIcon method={transaction.paymentMethod} />
                        <span className="text-xs text-slate-500">
                          •••• {transaction.paymentMethod.last4}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[150px] truncate py-3 px-4">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 py-3 px-4">
                      {transaction.customer}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 py-3 px-4">
                      {transaction.date}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 py-3 px-4">
                      {transaction.refundedDate}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 py-3 px-4">
                      {transaction.declineReason}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-slate-100/70"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => onRefund(transaction)}
                            className="text-xs"
                          >
                            Rambursează plata
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onSendReceipt(transaction)}
                            className="text-xs"
                          >
                            Trimite chitanța
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => copyPaymentId(transaction.id)}
                            className="text-xs"
                          >
                            Copiază ID-ul plății
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Connections</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => onViewDetails(transaction)}
                            className="text-xs"
                          >
                            Vezi detalii plată
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-slate-500">
          Afișare 1–20 din {statusCounts.all} rezultate
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50"
          >
            Următorul
          </Button>
        </div>
      </div>

      {/* Refund confirm dialog */}
      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă rambursarea</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTx ? (
                <span>
                  Vei rambursa plata{" "}
                  <span className="font-medium">{selectedTx.amount}</span> (
                  {selectedTx.id}). Această acțiune poate fi ireversibilă.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRefund}>
              Confirmă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalii plată</DialogTitle>
            <DialogDescription>
              Informații pentru ID: {selectedTx?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sumă</span>
                <span className="font-medium">
                  {selectedTx.amount} {selectedTx.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-medium">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client</span>
                <span className="font-medium">{selectedTx.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data</span>
                <span className="font-medium">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metodă</span>
                <span className="font-medium">
                  {selectedTx.paymentMethod?.brand?.toUpperCase()} ••••{" "}
                  {selectedTx.paymentMethod?.last4}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rambursată</span>
                <span className="font-medium">{selectedTx.refundedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Motiv respingere</span>
                <span className="font-medium">{selectedTx.declineReason}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Închide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
