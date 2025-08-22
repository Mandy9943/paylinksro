"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venituri lunare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              0,00 RON
            </div>
            <p className="text-sm text-gray-500">Nu sunt venituri încă</p>
            <div className="mt-4 h-32 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <div className="text-white text-sm font-medium">
                📊 Grafic indisponibil
              </div>
            </div>
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
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">0%</span>
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
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">0%</span>
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
            <div className="text-2xl font-bold text-gray-900">--</div>
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
            <div className="text-2xl font-bold text-gray-900">--</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Disputuri</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Clienți noi</h3>
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
