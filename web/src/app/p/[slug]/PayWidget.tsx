"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function fetchPK(): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/stripe/pk`);
  if (!res.ok) throw new Error("Failed to load Stripe key");
  const json = await res.json();
  return json.publishableKey as string;
}

async function createPublicPI(slug: string, amount?: number) {
  const res = await fetch(
    `${API_BASE}/v1/paylinks/public/${encodeURIComponent(
      slug
    )}/payment-intents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Payment error");
  return json.client_secret as string;
}

// StartForm: shown before a PaymentIntent exists. No Stripe hooks used here.
function StartForm({
  setClientSecret,
  requiresAmount,
  slug,
  minAmount,
}: {
  setClientSecret: (v: string) => void;
  requiresAmount: boolean;
  slug: string;
  minAmount?: number | null;
}) {
  const [amount, setAmount] = useState<string>(
    minAmount ? String(minAmount) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePI = async () => {
    try {
      setLoading(true);
      setError(null);
      const val = requiresAmount ? parseFloat(amount || "0") : undefined;
      const cs = await createPublicPI(slug, val);
      setClientSecret(cs);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Cannot create payment";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {requiresAmount && (
        <div>
          <Label className="text-xs text-gray-600">Suma de plată (RON)</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={
              minAmount && minAmount > 0
                ? `Minim ${minAmount}`
                : "Introduceți suma"
            }
            className="mt-1"
          />
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button
        onClick={handleCreatePI}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? "Se pregătește plata..." : "Continuă către plată"}
      </Button>
    </div>
  );
}

// PaymentForm: rendered inside <Elements> only. Safe to use Stripe hooks here.
function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) setError(error.message || "Payment failed");
    else setSucceeded(true);
    setLoading(false);
  };

  if (succeeded) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">
            ✓
          </div>
          <div>
            <div className="font-medium">Thanks for your purchase!</div>
            <div className="text-sm text-green-900/80">
              Your payment was successful. A confirmation will be sent if an
              email was provided.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <PaymentElement />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Button
        type="submit"
        disabled={loading || succeeded}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {succeeded
          ? "Plata reușită"
          : loading
          ? "Se procesează..."
          : "Plătește acum"}
      </Button>
    </form>
  );
}

export default function PayWidget({
  slug,
  priceType,
  minAmount,
}: {
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  minAmount?: number | null;
}) {
  const requiresAmount = priceType === "FLEXIBLE";
  const [pk, setPk] = useState<string | null>(null);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const key = await fetchPK();
        if (ignore) return;
        setPk(key);
        // Initialize Stripe for the platform account (destination charges used server-side)
        setStripePromise(loadStripe(key));
        if (!requiresAmount) {
          // Fixed-price: create PI immediately
          const cs = await createPublicPI(slug);
          if (!ignore) setClientSecret(cs);
        }
      } catch {
        // noop
      }
    })();
    return () => {
      ignore = true;
    };
  }, [slug, requiresAmount]);

  const elementsOptions = useMemo(
    () => ({ clientSecret: clientSecret || undefined }),
    [clientSecret]
  );

  // If a clientSecret hasn't been created yet, show the StartForm (no Elements needed)
  if (!clientSecret) {
    return (
      <StartForm
        setClientSecret={setClientSecret}
        requiresAmount={requiresAmount}
        slug={slug}
        minAmount={minAmount}
      />
    );
  }

  // We have a clientSecret; ensure Stripe is loaded before mounting PaymentForm
  if (!pk || !stripePromise) {
    return <div className="text-sm text-gray-500">Se încarcă plata…</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={elementsOptions}
      key={clientSecret}
    >
      <PaymentForm />
    </Elements>
  );
}
