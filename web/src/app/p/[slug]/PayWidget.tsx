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

async function createPublicPI(
  slug: string,
  amount?: number,
  email?: string,
  addVat?: boolean
) {
  const res = await fetch(
    `${API_BASE}/v1/paylinks/public/${encodeURIComponent(
      slug
    )}/payment-intents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, email, addVat }),
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
  requireEmail,
  onEmailCaptured,
  onAmountChange,
  addVat,
}: {
  setClientSecret: (v: string) => void;
  requiresAmount: boolean;
  slug: string;
  minAmount?: number | null;
  requireEmail?: boolean;
  onEmailCaptured?: (email: string | undefined) => void;
  onAmountChange?: (amount?: number) => void;
  addVat?: boolean;
}) {
  const [amount, setAmount] = useState<string>(
    minAmount ? String(minAmount) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  // Inform parent of the initial/default amount
  useEffect(() => {
    if (onAmountChange) {
      const initial = requiresAmount
        ? parseFloat((minAmount ?? 0).toString()) || undefined
        : undefined;
      // Only propagate if minAmount exists
      if (minAmount) {
        onAmountChange(initial);
        try {
          window.dispatchEvent(
            new CustomEvent("paylink:amount-change", {
              detail: { slug, amount: initial },
            })
          );
        } catch {
          // noop
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePI = async () => {
    try {
      setLoading(true);
      setError(null);
      const val = requiresAmount ? parseFloat(amount || "0") : undefined;
      const emailToUse = requireEmail ? email || undefined : undefined;
      if (onEmailCaptured) onEmailCaptured(emailToUse);
      const cs = await createPublicPI(slug, val, emailToUse, addVat);
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
            onChange={(e) => {
              setAmount(e.target.value);
              if (onAmountChange) {
                const v = parseFloat(e.target.value);
                onAmountChange(Number.isFinite(v) && v > 0 ? v : undefined);
              }
              try {
                const v = parseFloat(e.target.value);
                const amt = Number.isFinite(v) && v > 0 ? v : undefined;
                window.dispatchEvent(
                  new CustomEvent("paylink:amount-change", {
                    detail: { slug, amount: amt },
                  })
                );
              } catch {
                // noop
              }
            }}
            placeholder={
              minAmount && minAmount > 0
                ? `Minim ${minAmount}`
                : "Introduceți suma"
            }
            className="mt-1"
          />
        </div>
      )}

      {requireEmail && (
        <div>
          <Label className="text-xs text-gray-600">Adresa de email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nume@exemplu.com"
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
function PaymentForm({
  requirePhone,
  requireBilling,
  payerEmail,
}: {
  requirePhone?: boolean;
  requireBilling?: boolean;
  payerEmail?: string | undefined;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("RO");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const billingDetails: any = {
      name: name || undefined,
      email: payerEmail || undefined,
      phone: requirePhone ? phone || undefined : undefined,
      address: requireBilling
        ? {
            line1: addr1 || undefined,
            line2: addr2 || undefined,
            city: city || undefined,
            postal_code: postal || undefined,
            country: country || undefined,
          }
        : undefined,
    };
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: billingDetails,
        },
      },
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
            <div className="font-medium">Mulțumim pentru achiziție!</div>
            <div className="text-sm text-green-900/80">
              Plata a fost efectuată cu succes. Dacă ați furnizat o adresă de
              email, veți primi o confirmare.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600">Nume pe card</Label>
          <Input
            placeholder="Numele complet de pe card"
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {requirePhone && (
          <div>
            <Label className="text-xs text-gray-600">Număr de telefon</Label>
            <Input
              placeholder="+40 XXX XXX XXX"
              className="mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}
        {requireBilling && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Adresa de facturare</Label>
            <Input
              placeholder="Adresa linia 1"
              className="mt-1"
              value={addr1}
              onChange={(e) => setAddr1(e.target.value)}
            />
            <Input
              placeholder="Adresa linia 2"
              className="mt-1"
              value={addr2}
              onChange={(e) => setAddr2(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Oraș"
                className="flex-1"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                placeholder="Cod poștal"
                className="w-28"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
              />
              <Input
                placeholder="Țara (ex: RO)"
                className="w-24"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
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
  requireEmail,
  requirePhone,
  requireBilling,
  onAmountChange,
  addVat,
}: {
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  minAmount?: number | null;
  requireEmail?: boolean;
  requirePhone?: boolean;
  requireBilling?: boolean;
  onAmountChange?: (amount?: number) => void;
  addVat?: boolean;
}) {
  const requiresAmount = priceType === "FLEXIBLE";
  const [pk, setPk] = useState<string | null>(null);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const key = await fetchPK();
        if (ignore) return;
        setPk(key);
        // Initialize Stripe for the platform account (destination charges used server-side)
        setStripePromise(
          loadStripe(key, {
            locale: "ro",
          })
        );
        if (!requiresAmount && !requireEmail) {
          // Fixed-price: create PI immediately
          const cs = await createPublicPI(slug, undefined, undefined, addVat);
          if (!ignore) setClientSecret(cs);
        }
      } catch {
        // noop
      }
    })();
    return () => {
      ignore = true;
    };
  }, [slug, requiresAmount, requireEmail, addVat]);

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
        requireEmail={requireEmail}
        onEmailCaptured={setPayerEmail}
        onAmountChange={onAmountChange}
        addVat={addVat}
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
      <PaymentForm
        requirePhone={requirePhone}
        requireBilling={requireBilling}
        payerEmail={payerEmail}
      />
    </Elements>
  );
}
