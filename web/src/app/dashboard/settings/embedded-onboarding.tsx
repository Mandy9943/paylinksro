"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState } from "react";

export default function EmbeddedOnboarding() {
  const { refresh: refreshStripe } = useStripeAccount();
  const { refresh: refreshAuth } = useAuth();
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      // Ensure or fetch the user's connected account id from the server
      const { data: me } = await api.get(`/v1/stripe/accounts/me`);
      const accountId = me.id as string;
      // Get publishable key
      const { data: pkRes } = await api.get(`/v1/stripe/pk`);
      if (!pkRes?.publishableKey) {
        setError("Publishable key not configured on server");
        return;
      }
      // Initialize Connect with fetchClientSecret to retrieve the Account Session client secret
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
      setError(msg || "Error starting embedded onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embedded onboarding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={start} disabled={loading}>
          Start embedded onboarding
        </Button>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {connectInstance ? (
          <ConnectComponentsProvider connectInstance={connectInstance}>
            <ConnectAccountOnboarding
              onExit={async () => {
                // Refresh client views; webhook will update server state shortly after completion
                await Promise.all([refreshStripe(), refreshAuth()]);
              }}
            />
          </ConnectComponentsProvider>
        ) : null}
      </CardContent>
    </Card>
  );
}
