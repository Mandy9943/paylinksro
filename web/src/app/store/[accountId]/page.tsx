"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";
import useSWR from "swr";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  default_price?: {
    id: string;
    unit_amount?: number | null;
    currency?: string;
  };
};

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/store/success" },
      redirect: "if_required",
    });
    if (error) alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button onClick={pay} disabled={submitting || !stripe} className="w-full">
        Pay now
      </Button>
    </div>
  );
}

export default function Storefront({
  params,
}: {
  params: { accountId: string };
}) {
  // WARNING: Demo uses Stripe account ID in URL; use your own stable slug in production
  const accountId = params.accountId;
  const { data, isLoading } = useSWR(
    accountId ? ["products", accountId] : null,
    async () => {
      const { data } = await api.get(`/v1/stripe/products`, {
        params: { accountId },
      });
      return data as { products: Product[] };
    }
  );
  const [pk, setPk] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), [pk]);

  const buy = async (priceId: string) => {
    // Initialize publishable key and create a PaymentIntent on the server
    const { data: pkRes } = await api.get(`/v1/stripe/pk`);
    setPk(pkRes.publishableKey);
    const { data: pi } = await api.post(`/v1/stripe/payment-intents`, {
      accountId,
      priceId,
      quantity: 1,
      applicationFeeAmount: 123,
    });
    setClientSecret(pi.client_secret);
  };

  if (isLoading) return <div className="p-6">Loading products…</div>;
  const products = data?.products ?? [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store</h1>
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => {
            const price = p.default_price;
            const amount = price?.unit_amount ?? 0;
            const currency = (price?.currency ?? "usd").toUpperCase();
            return (
              <div key={p.id} className="border rounded-md p-4 space-y-2">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.description}</div>
                <div className="text-lg">
                  {amount ? (amount / 100).toFixed(2) : "0.00"} {currency}
                </div>
                {price?.id && (
                  <Button onClick={() => buy(price.id)} className="w-full">
                    Buy
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pk && clientSecret && stripePromise && (
        <div className="max-w-md">
          <Elements options={{ clientSecret }} stripe={stripePromise}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        </div>
      )}
    </div>
  );
}
