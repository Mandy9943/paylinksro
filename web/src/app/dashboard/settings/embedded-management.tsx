"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  loadConnectAndInitialize,
  type StripeConnectInstance,
} from "@stripe/connect-js";
import {
  ConnectAccountManagement,
  ConnectComponentsProvider,
  ConnectNotificationBanner,
} from "@stripe/react-connect-js";
import { useState } from "react";

export default function EmbeddedManagement() {
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: me } = await api.get(`/v1/stripe/accounts/me`);
      const accountId: string = me.id;
      const { data: pkRes } = await api.get(`/v1/stripe/pk`);
      if (!pkRes?.publishableKey) {
        setError("Publishable key not configured on server");
        return;
      }
      const instance = await loadConnectAndInitialize({
        publishableKey: pkRes.publishableKey,
        fetchClientSecret: async () => {
          const { data: sess } = await api.post(
            `/v1/stripe/accounts/${accountId}/account-session`,
            { component: "management" }
          );
          return sess.client_secret as string;
        },
        locale: "ro",
      });
      setConnectInstance(instance);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Error starting embedded management");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrare cont de plăți</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={start} disabled={loading}>
          Deschide administrarea
        </Button>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {connectInstance ? (
          <ConnectComponentsProvider connectInstance={connectInstance}>
            {/* Required notification banner when Stripe handles negative balances */}
            <ConnectNotificationBanner />
            <div className="mt-4">
              <ConnectAccountManagement />
            </div>
          </ConnectComponentsProvider>
        ) : null}
      </CardContent>
    </Card>
  );
}
