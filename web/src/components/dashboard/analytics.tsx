"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAnalyticsSummary,
  usePaymentMethods,
  useRefreshAnalytics,
} from "@/hooks/useAnalytics";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import RevenueChart from "./RevenueChart";

export default function Analytics() {
  const { data: summary } = useAnalyticsSummary();
  const { data: methods } = usePaymentMethods();
  const gross = (summary?.revenueGrossMinor ?? 0) / 100;
  const success = summary?.successCount ?? 0;
  const disputes = summary?.disputesCount ?? 0;
  const newCustomers = summary?.newCustomers ?? 0;
  const avgMs = summary?.avgProcessingMs ?? null;
  const avgLabel = avgMs != null ? `${Math.round(avgMs / 1000)}s` : "--";
  const visaPct = methods?.find((m) => m.brand === "visa")?.pct ?? 0;
  const mcPct = methods?.find((m) => m.brand === "mastercard")?.pct ?? 0;
  const { refresh, isRefreshing } = useRefreshAnalytics();
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => refresh()}
          disabled={isRefreshing}
          className="text-sm px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
        >
          {isRefreshing ? "Se actualizează…" : "Refresh analytics"}
        </button>
      </div>
      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venituri lunare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {gross.toFixed(2)} RON
            </div>
            {gross > 0 ? null : (
              <p className="text-sm text-gray-500">Nu sunt venituri încă</p>
            )}
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metode de plată</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="text-blue-500 h-5 w-5 mr-3" />
                  <span>Visa</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${visaPct}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{visaPct}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="text-red-500 h-5 w-5 mr-3" />
                  <span>Mastercard</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${mcPct}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{mcPct}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">
                Tranzacții de succes
              </h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{success}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">
                Timp mediu procesare
              </h3>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{avgLabel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Disputuri</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{disputes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Clienți noi</h3>
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {newCustomers}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
