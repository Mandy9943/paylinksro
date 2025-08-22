"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Building2, Clock, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

export default function Payouts() {
  // Removed react-query usage

  const available: {
    available: number;
    processing?: number;
    totalTransferred?: number;
  } = {
    available: 0,
    processing: 0,
    totalTransferred: 0,
  };

  const bank: { accountName?: string; iban?: string; bankName?: string } = {};

  const [accountName, setAccountName] = useState(bank?.accountName ?? "");
  const [iban, setIban] = useState(bank?.iban ?? "");
  const [bankName, setBankName] = useState(bank?.bankName ?? "");

  // Stubs until API exists
  const [savePending, setSavePending] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const saveBank = {
    isPending: savePending,
    mutate: async (data: {
      iban: string;
      accountName: string;
      bankName: string;
    }) => {
      try {
        setSavePending(true);
        void data; // TODO: call API
      } finally {
        setSavePending(false);
      }
    },
  } as const;
  const requestPayout = {
    isPending: requestPending,
    mutate: async () => {
      try {
        setRequestPending(true);
        // TODO: call API
      } finally {
        setRequestPending(false);
      }
    },
  } as const;

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg font-semibold">
                Sold disponibil
              </CardTitle>
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {available ? `${available.available.toFixed(2)} RON` : "0,00 RON"}
            </div>
            <p className="text-sm text-gray-500">
              Fonduri eligibile pentru payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg font-semibold">
                În procesare
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {available?.processing?.toFixed(2) ?? "0,00"} RON
            </div>
            <p className="text-sm text-gray-500">Transferuri în curs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg font-semibold">
                Total transferat
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {available?.totalTransferred?.toFixed(2) ?? "0,00"} RON
            </div>
            <p className="text-sm text-gray-500">Suma totală transferată</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Account Setup and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contul tău bancar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountName">Nume titular</Label>
              <Input
                id="accountName"
                placeholder="ex: SRL COMPANY EXAMPLE"
                className="mt-2"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                placeholder="RO49 AAAA 1B31 0075 9384 0000"
                className="mt-2"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bank">Bancă</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selectează banca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCR">BCR</SelectItem>
                  <SelectItem value="BRD">BRD</SelectItem>
                  <SelectItem value="ING Bank">ING Bank</SelectItem>
                  <SelectItem value="Raiffeisen Bank">
                    Raiffeisen Bank
                  </SelectItem>
                  <SelectItem value="UniCredit Bank">UniCredit Bank</SelectItem>
                  <SelectItem value="CEC Bank">CEC Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full paylink-button-primary"
              onClick={() => saveBank.mutate({ iban, accountName, bankName })}
              disabled={saveBank.isPending}
            >
              {saveBank.isPending ? "Se salvează..." : "Salvează contul bancar"}
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => requestPayout.mutate()}
              disabled={
                requestPayout.isPending || (available?.available ?? 0) <= 0
              }
            >
              {requestPayout.isPending ? "Se solicită..." : "Solicită payout"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Istoric transferuri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Niciun transfer încă
              </h3>
              <p className="text-gray-500 mb-4">
                Istoricul transferurilor tale va apărea aici.
              </p>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                onClick={() => requestPayout.mutate()}
                disabled={(available?.available ?? 0) <= 0}
              >
                Inițiază transfer manual
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
