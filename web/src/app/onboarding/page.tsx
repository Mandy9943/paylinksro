"use client";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  loadConnectAndInitialize,
  type StripeConnectInstance,
} from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { onboarded, refresh: refreshAuth } = useAuth();
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If already onboarded, go to dashboard
  useEffect(() => {
    if (onboarded) router.replace("/dashboard");
  }, [onboarded, router]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const { data: me } = await api.get(`/v1/stripe/accounts/me`);
        const accountId: string = me.id;
        const { data: pkRes } = await api.get(`/v1/stripe/pk`);
        if (!pkRes?.publishableKey) {
          setError("Cheia publică nu este configurată.");
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
        if (!cancelled) setConnectInstance(instance);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          msg || "Eroare la inițializarea configurării contului de plăți."
        );
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2">
          Configurare cont de plăți
        </h1>
        <p className="text-slate-600 mb-6">
          Completează pașii pentru a putea primi plăți. Aceasta durează doar
          câteva minute.
        </p>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {connectInstance && (
          <ConnectComponentsProvider connectInstance={connectInstance}>
            <ConnectAccountOnboarding
              onExit={async () => {
                await refreshAuth();
                try {
                  const { data } = await api.get(`/v1/me`);
                  if (data?.onboarded) router.replace("/dashboard");
                } catch {}
              }}
            />
          </ConnectComponentsProvider>
        )}
      </div>
    </div>
  );
}
