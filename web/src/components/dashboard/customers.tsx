import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/useCustomers";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CreditCard, Users } from "lucide-react";
import { useMemo, useState } from "react";

const customerTabs = [
  { id: "all", label: "Toți", count: null },
  { id: "top", label: "Clienți top", count: null },
  { id: "first-time", label: "Clienți noi", count: null },
  { id: "repeat", label: "Clienți recurenți", count: null },
  { id: "recent", label: "Clienți recenți", count: null },
  { id: "high-refunds", label: "Rambursări multe", count: null },
  { id: "high-disputes", label: "Contestații multe", count: null },
];

function formatRON(minor?: number) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
  }).format(((minor ?? 0) as number) / 100);
}

type PM = { brand?: string | null };
function PaymentMethodIcon({ method }: { method: PM }) {
  if (method?.brand === "visa") {
    return (
      <div className="w-6 h-4 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
        VISA
      </div>
    );
  }
  if (method?.brand === "mastercard") {
    return (
      <div className="w-6 h-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded">
        MC
      </div>
    );
  }
  if (method?.brand === "amex") {
    return (
      <div className="w-6 h-4 bg-green-600 text-white text-xs font-bold flex items-center justify-center rounded">
        AX
      </div>
    );
  }
  return <CreditCard className="w-4 h-4 text-gray-400" />;
}

export default function Customers() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading } = useCustomers(activeTab);

  const allCustomers = useMemo(() => data?.items ?? [], [data]);
  const filteredCustomers = useMemo(() => allCustomers, [allCustomers]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {customerTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="text-xs h-8"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Customers Table */}
      <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">Se încarcă...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Nu ai clienți încă
              </h3>
              <p className="text-sm text-slate-500">
                Clienții vor apărea aici odată ce vei primi primul tău payment.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200/60 hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Client
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Email
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Metodă de plată
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Total cheltuit
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Plăți
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-xs font-medium text-slate-500 bg-slate-50/50 py-3">
                        Ultima vizită
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer, index) => (
                      <TableRow
                        key={index}
                        className="border-slate-200/40 hover:bg-slate-50/30 transition-colors"
                      >
                        <TableCell className="py-3">
                          <div>
                            <div className="font-medium text-slate-900">
                              {customer.name || customer.email || "—"}
                            </div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {(customer.payments ?? 0) > 1
                                ? "Recurent"
                                : "Nou"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-slate-600 py-3">
                          {customer.email || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-3">
                          <div className="flex items-center space-x-2">
                            <PaymentMethodIcon method={{ brand: undefined }} />
                            <span className="text-xs text-slate-600">
                              {/* Last4 not stored per-customer in this view */}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 py-3">
                          {formatRON(customer.totalAmount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-slate-600 py-3">
                          {customer.payments}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-slate-500 py-3">
                          {formatDate(customer.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/60">
                  <div className="text-sm text-slate-500">
                    Se afișează {startIndex + 1}-
                    {Math.min(endIndex, filteredCustomers.length)} din{" "}
                    {filteredCustomers.length} clienți
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600">
                      Pagina {currentPage} din {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
