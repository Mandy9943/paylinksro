"use client";
import { useEffect, useMemo, useState } from "react";

export default function PayLinkPreview({
  slug,
  type,
  priceType,
  amount,
  minAmount,
  name,
}: {
  slug: string;
  type: "servicii" | "produse-digitale" | "donatii" | "fundraising";
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number | null;
  minAmount?: number | null;
  name: string;
}) {
  const [liveAmount, setLiveAmount] = useState<number | undefined>(
    typeof amount === "number" ? amount : undefined
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ slug: string; amount?: number }>;
      if (!ce.detail) return;
      if (ce.detail.slug !== slug) return;
      setLiveAmount(ce.detail.amount);
    };
    window.addEventListener("paylink:amount-change", handler as EventListener);
    return () =>
      window.removeEventListener(
        "paylink:amount-change",
        handler as EventListener
      );
  }, [slug]);

  const totalDueLabel = useMemo(() => {
    if (type === "fundraising") return "Enter amount below";
    if (priceType === "FIXED") return `RON ${amount ?? 0}`;
    if (typeof liveAmount === "number" && liveAmount > 0)
      return `RON ${liveAmount}`;
    if (minAmount && minAmount > 0) return `RON ${minAmount}+`;
    return "La completarea formularului";
  }, [type, priceType, amount, minAmount, liveAmount]);

  const lineAmount = useMemo(() => {
    if (type === "fundraising") return "Any amount";
    if (priceType === "FLEXIBLE") {
      if (typeof liveAmount === "number" && liveAmount > 0)
        return `RON ${liveAmount}`;
      if (minAmount && minAmount > 0) return `RON ${minAmount}+`;
      return "Sumă la alegere";
    }
    return `RON ${amount ?? 0}`;
  }, [type, priceType, amount, minAmount, liveAmount]);

  const headerAmount = useMemo(() => {
    if (type === "fundraising") return "Any amount";
    if (priceType === "FLEXIBLE") {
      if (typeof liveAmount === "number" && liveAmount > 0)
        return `RON ${liveAmount}`;
      if (minAmount && minAmount > 0) return `RON ${minAmount}+`;
      return "Sumă la alegere";
    }
    return `RON ${amount ?? 0}`;
  }, [type, priceType, amount, minAmount, liveAmount]);

  return (
    <div className="space-y-2 text-sm">
      <div className="text-2xl font-bold text-gray-900 mb-6">
        {headerAmount}
      </div>
      <div className="flex justify-between">
        <span>{name}</span>
        <span>{lineAmount}</span>
      </div>
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>
          {type === "fundraising" ? "Enter amount below" : lineAmount}
        </span>
      </div>
      {type === "fundraising" ? (
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Total due</span>
          <span>Enter amount below</span>
        </div>
      ) : priceType === "FIXED" ? (
        <>
          <div className="flex justify-between">
            <span>Tax %</span>
            <span>21%</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total due</span>
            <span>RON {amount ?? 0}</span>
          </div>
        </>
      ) : (
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Total due</span>
          <span>{totalDueLabel}</span>
        </div>
      )}
    </div>
  );
}
