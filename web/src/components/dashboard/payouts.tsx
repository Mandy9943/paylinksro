"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useStripeAccount } from "@/hooks/useStripeAccount";
import { api } from "@/lib/api";
import {
  loadConnectAndInitialize,
  type StripeConnectInstance,
} from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
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

  // Onboarding modal state
  const [showModal, setShowModal] = useState(false);
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const { refresh: refreshAuth } = useAuth();
  const { refresh: refreshStripe } = useStripeAccount();

  const startOnboarding = async () => {
    setLoadingConnect(true);
    setConnectError(null);
    try {
      const { data: me } = await api.get(`/v1/stripe/accounts/me`);
      const accountId: string = me.id;
      const { data: pkRes } = await api.get(`/v1/stripe/pk`);
      if (!pkRes?.publishableKey) {
        setConnectError("Cheia publică nu este configurată.");
        return;
      }
      const instance = await loadConnectAndInitialize({
        publishableKey: pkRes.publishableKey,
        fetchClientSecret: async () => {
          const { data: sess } = await api.post(
            `/v1/stripe/accounts/${accountId}/account-session`,
            {}
          );
          return sess.client_secret as string;
        },
        appearance: { overlays: "dialog" },
      });
      setConnectInstance(instance);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setConnectError(msg || "Nu s-a putut porni configurarea.");
    } finally {
      setLoadingConnect(false);
    }
  };
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

      {/* Empty state callout (center) */}
      <Card>
        <CardContent className="p-10">
          <div className="flex flex-col items-center text-center gap-3">
            <Wallet className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              Nu ai primit plăți până acum
            </h3>
            <p className="text-gray-500 max-w-md">
              Când vei primi primele plăți, le vei putea retrage direct în
              contul tău bancar.
            </p>
            <Button
              className="mt-2"
              onClick={() => {
                setShowModal(true);
              }}
            >
              Retrage fonduri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Setup and History */}
      <div className="grid grid-cols-1 gap-6">
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

      {/* Onboarding modal */}
      <Dialog open={showModal} onOpenChange={(o: boolean) => setShowModal(o)}>
        <DialogContent
          className=" sm:max-w-2xl max-h-[85vh] overflow-y-auto"
          showCloseButton={false}
        >
          {!connectInstance && (
            <DialogHeader>
              <DialogTitle>Configurează metoda de plată</DialogTitle>
              <DialogDescription asChild>
                <div className="text-left space-y-2">
                  <p>Configurează contul pentru a primi plăți.</p>
                  <p>
                    Configurezi un cont Express Payout prin PayLinks, nu un cont
                    Stripe complet.
                  </p>
                  <p>
                    Următorul pas: vei introduce detaliile contului bancar
                    pentru a putea trimite plăți. Nu-ți face griji, nu stocăm
                    niciodată datele personale sau bancare.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
          )}
          {/* Close button is provided by DialogContent by default; using footer actions to close */}
          {connectError && (
            <div className="text-sm text-red-600 mb-2">{connectError}</div>
          )}
          {connectInstance ? (
            <div className="mt-2 max-h-[65vh]  pr-1">
              <ConnectComponentsProvider connectInstance={connectInstance}>
                <ConnectAccountOnboarding
                  onExit={async () => {
                    await Promise.all([refreshAuth(), refreshStripe()]);
                    setShowModal(false);
                  }}
                />
              </ConnectComponentsProvider>
            </div>
          ) : (
            <DialogFooter>
              <Button onClick={startOnboarding} disabled={loadingConnect}>
                {loadingConnect ? "Se încarcă…" : "Introduc datele bancare"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
