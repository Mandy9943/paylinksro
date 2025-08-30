"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { formatDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function formatAmount(minor: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency?.toUpperCase() || "RON",
  }).format((minor || 0) / 100);
}

type PaymentMethod = { brand?: string | null };
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
  const { data, isLoading } = useTransactions(statusFilter);

  const copyToClipboard = async (text: string, successMsg = "Copiat") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
    } catch {
      toast.error("Copiere eșuată");
    }
  };

  const statusCounts = useMemo(
    () => ({
      all: data?.counts.all ?? 0,
      succeeded: data?.counts.succeeded ?? 0,
      refunded: data?.counts.refunded ?? 0,
      disputed: data?.counts.disputed ?? 0,
      failed: data?.counts.failed ?? 0,
      uncaptured: data?.counts.uncaptured ?? 0,
    }),
    [data]
  );

  const filteredTransactions = useMemo(() => {
    const items = data?.items ?? [];
    return items.map((t) => ({
      id: t.id,
      amount: formatAmount(t.amount, t.currency),
      status:
        t.status === "SUCCEEDED"
          ? "Succeeded"
          : t.status === "FAILED"
          ? "Failed"
          : t.status === "REFUNDED"
          ? "Refunded"
          : t.status === "DISPUTED"
          ? "Disputed"
          : t.status === "UNCAPTURED"
          ? "Uncaptured"
          : t.status === "REQUIRES_ACTION"
          ? "Requires action"
          : t.status,
      paymentMethod: {
        type: t.paymentMethodType || "card",
        brand: t.cardBrand || "card",
        last4: t.cardLast4 || "0000",
      },
  customer: t.customer?.email || "-",
  customerEmail: t.customer?.email || null,
      date: formatDate(t.createdAt),
    }));
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Status Filter Cards */}
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
              <div className="text-xs text-slate-500 mb-1">Reușite</div>
              <div className="text-lg font-semibold text-emerald-600">
                {statusCounts.succeeded}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
              statusFilter === "refunded"
                ? "ring-1 ring-blue-500 bg-blue-50/50"
                : "bg-white hover:bg-slate-50/50"
            }`}
            onClick={() => setStatusFilter("refunded")}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Rambursate</div>
              <div className="text-lg font-semibold text-blue-600">
                {statusCounts.refunded}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
              statusFilter === "disputed"
                ? "ring-1 ring-amber-500 bg-amber-50/50"
                : "bg-white hover:bg-slate-50/50"
            }`}
            onClick={() => setStatusFilter("disputed")}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Contestate</div>
              <div className="text-lg font-semibold text-amber-600">
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
              <div className="text-xs text-slate-500 mb-1">Eșuate</div>
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
              <div className="text-xs text-slate-500 mb-1">Necapturate</div>
              <div className="text-lg font-semibold text-slate-600">
                {statusCounts.uncaptured}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-sm text-slate-500">Se încarcă...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Nu ai tranzacții încă
                </h3>
                <p className="text-sm text-slate-500">
                  Tranzacțiile vor apărea aici odată ce vei primi plăți.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200/60 hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        ID Tranzacție
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Sumă
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Metodă de plată
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Client
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Data
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-slate-200/40 hover:bg-slate-50/30 transition-colors"
                      >
                        <TableCell
                          className="font-mono text-xs text-slate-600 py-3 cursor-pointer"
                          title="Copiază ID tranzacție"
                          onClick={() => copyToClipboard(transaction.id, "ID copiat")}
                        >
                          {transaction.id}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 py-3">
                          {transaction.amount}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant={
                              transaction.status === "Succeeded"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center space-x-2">
                            <PaymentMethodIcon
                              method={transaction.paymentMethod}
                            />
                            <span className="text-xs text-slate-600">
                              •••• {transaction.paymentMethod.last4}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-sm text-slate-600 py-3 ${transaction.customerEmail ? "cursor-pointer" : ""}`}
                          title={transaction.customerEmail ? "Copiază email" : undefined}
                          onClick={transaction.customerEmail ? () => copyToClipboard(transaction.customerEmail as string, "Email copiat") : undefined}
                        >
                          {transaction.customer}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 py-3">
                          {transaction.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
