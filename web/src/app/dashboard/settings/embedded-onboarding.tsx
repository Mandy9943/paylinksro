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
import { useEffect, useState } from "react";

export default function EmbeddedOnboarding() {
  const { refresh: refreshStripe } = useStripeAccount();
  const { refresh: refreshAuth } = useAuth();
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);

  // Highlight card when navigated via #onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#onboarding") {
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 2500);
      return () => clearTimeout(t);
    }
  }, []);

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
        locale: "ro",
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
    <Card
      id="onboarding"
      className={
        highlight
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white animate-[pulse_1.2s_ease-in-out_2]"
          : undefined
      }
    >
      <CardHeader>
        <CardTitle>Configurare cont de plăți</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-600">
          Pentru a începe să accepți plăți și să primești transferuri,
          finalizează configurarea contului tău de plăți.
        </div>
        <Button
          onClick={start}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-4"
        >
          Începe configurarea
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
