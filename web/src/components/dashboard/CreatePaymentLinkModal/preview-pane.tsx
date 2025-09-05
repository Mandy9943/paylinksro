"use client";
import PayLinkPreview from "@/app/p/[slug]/PayLinkPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Lock, Monitor, Smartphone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { CreatePaymentLinkFormValues } from "./types";

export function PreviewPane() {
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const { control } = useFormContext<CreatePaymentLinkFormValues>();

  const type = useWatch({ control, name: "type" });
  const name = useWatch({ control, name: "name" });
  const displayName = useWatch({ control, name: "displayName" });
  const description = useWatch({ control, name: "description" });
  const priceType = useWatch({ control, name: "priceType" });
  const amount = useWatch({ control, name: "amount" });
  const minAmount = useWatch({ control, name: "minAmount" });
  const collectEmail = useWatch({ control, name: "collectEmail" });
  const collectPhone = useWatch({ control, name: "collectPhone" });
  const collectBillingAddress = useWatch({
    control,
    name: "collectBillingAddress",
  });
  const addVat = useWatch({ control, name: "addVat" });
  const mainColor = useWatch({ control, name: "mainColor" });
  const targetAmount = useWatch({ control, name: "targetAmount" }) || 1000;
  const productCoverImageUrl = useWatch({
    control,
    name: "productCoverImageUrl",
  });
  const fundraisingCoverImageUrl = useWatch({
    control,
    name: "fundraisingCoverImageUrl",
  });
  const currentRaised = 250; // demo

  // Normalize values for the shared preview used on the public checkout page
  const normalizedType = (type || "servicii") as
    | "servicii"
    | "produse-digitale"
    | "donatii"
    | "fundraising";
  const normalizedPriceType = (priceType === "fixed" ? "FIXED" : "FLEXIBLE") as
    | "FIXED"
    | "FLEXIBLE";
  const coverImageUrl =
    (normalizedType === "fundraising"
      ? fundraisingCoverImageUrl
      : productCoverImageUrl) || "";
  const mainBg = mainColor || "#fbbf24";
  const slug = "demo-link";

  return (
    <div className="w-full md:w-1/2 bg-gray-50 p-4 md:p-6 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Previzualizare</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              className="p-1"
              onClick={(e) => {
                e.preventDefault();
                setPreviewMode("desktop");
              }}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              className="p-1"
              onClick={(e) => {
                e.preventDefault();
                setPreviewMode("mobile");
              }}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-sm border ${
          previewMode === "mobile" ? "max-w-sm mx-auto" : "max-w-4xl mx-auto"
        }`}
      >
        <div className={`${previewMode === "desktop" ? "flex" : ""}`}>
          {/* Left - mirrors checkout card */}
          <div
            className={`${previewMode === "desktop" ? "w-1/2" : ""} p-6 ${
              previewMode === "mobile" ? "rounded-t-lg" : "rounded-l-lg"
            }`}
            style={{ backgroundColor: mainBg }}
          >
            <div className="space-y-4 md:space-y-6">
              {/* Header with avatar and title */}
              <div className="flex items-start gap-4 md:gap-5">
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl shadow-black/20 ring-2 ring-white/50 bg-gradient-to-br from-white to-gray-100">
                    {coverImageUrl ? (
                      <Image
                        src={coverImageUrl}
                        alt="Cover"
                        fill
                        className="object-cover rounded-full"
                        sizes="80px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h1 className="text-xl md:text-2xl font-bold text-black leading-tight tracking-tight truncate">
                    {name || "Titlu produs/serviciu"}
                  </h1>
                  {displayName && (
                    <div className="text-black/90 mt-1 text-sm font-semibold truncate">
                      {displayName}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {(description || name) && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-green-500/25 ring-2 ring-green-300/30">
                    <span className="text-white text-xs md:text-sm">✓</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="font-bold text-black text-base md:text-lg leading-tight truncate">
                      {normalizedType === "servicii"
                        ? "Sesiune de consultanță online"
                        : name || "Produs"}
                    </h3>
                    {description && (
                      <p className="text-sm md:text-base text-black/90 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Fundraising progress (if applicable) */}
              {normalizedType === "fundraising" && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-800/80">Progres</span>
                    <span className="text-xs text-gray-800/80">
                      {Math.min(
                        100,
                        (currentRaised / (targetAmount || 1)) * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentRaised / (targetAmount || 1)) * 100
                        ).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-800/90">
                    <span>{currentRaised} RON strânși</span>
                    <span>din {targetAmount} RON</span>
                  </div>
                </div>
              )}

              {/* Summary / Preview (same shared component as checkout) */}
              <div className="bg-black/10 rounded-lg p-3 md:p-4 space-y-3">
                <div className="text-center mb-3 md:mb-4">
                  <div className="text-2xl md:text-3xl font-bold text-black">
                    {normalizedPriceType === "FIXED" &&
                    typeof amount === "number"
                      ? `RON ${(amount ?? 0).toFixed(2)}`
                      : ""}
                  </div>
                </div>
                <PayLinkPreview
                  slug={slug}
                  type={normalizedType}
                  priceType={normalizedPriceType}
                  amount={amount ?? 0}
                  minAmount={minAmount ?? null}
                  name={name || "Produs"}
                  addVat={!!addVat}
                />
              </div>
            </div>
          </div>

          {/* Right - form preview (simplified Elements placeholder) */}
          <div className={`${previewMode === "desktop" ? "w-1/2" : ""} p-6`}>
            <div className="space-y-4">
              {priceType === "flexible" && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Suma de plată (RON)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={
                      minAmount && minAmount > 0
                        ? `Minim ${minAmount}`
                        : "Introduceți suma"
                    }
                    className="mt-1"
                    onChange={(e) => {
                      const val = parseFloat(
                        (e.target as HTMLInputElement).value
                      );
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("paylink:amount-change", {
                            detail: {
                              slug,
                              amount: isNaN(val) ? undefined : val,
                            },
                          })
                        );
                      }
                    }}
                  />
                </div>
              )}

              {collectEmail && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Adresa de email
                  </Label>
                  <Input placeholder="nume@exemplu.com" className="mt-1" />
                </div>
              )}

              {collectPhone && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Număr de telefon
                  </Label>
                  <Input placeholder="+40 XXX XXX XXX" className="mt-1" />
                </div>
              )}

              {/* Cardholder name */}
              <div>
                <Label className="text-xs text-gray-600">Nume pe card</Label>
                <Input
                  placeholder="Numele complet de pe card"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">Metodă de plată</Label>
                <div className="mt-1 p-3 border rounded-md bg-white">
                  {/* Header row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </div>
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Lock className="h-4 w-4" />
                      <span className="text-blue-600">
                        Finalizare sigură și rapidă a comenzii cu Link
                      </span>
                    </div>
                  </div>

                  {/* Card number */}
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        placeholder="1234 1234 1234 1234"
                        className="pr-20 text-sm"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <div
                          className="w-7 h-4 bg-[#1a1f71] rounded-sm"
                          title="VISA"
                        />
                        <div
                          className="w-7 h-4 bg-[#eb001b] rounded-sm"
                          title="Mastercard"
                        />
                        <div
                          className="w-7 h-4 bg-[#2e77bc] rounded-sm"
                          title="AmEx"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expiry + CVC */}
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="LL/AA" className="text-sm flex-1" />
                    <div className="relative w-28">
                      <Input placeholder="CVC" className="text-sm pr-10" />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-5 bg-gray-200 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Country is always visible in real checkout */}
              <div>
                <Label className="text-xs text-gray-600">Țară</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="România" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">România</SelectItem>
                    <SelectItem value="uy">Uruguay</SelectItem>
                    <SelectItem value="us">Statele Unite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {collectBillingAddress && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Adresa de facturare
                  </Label>
                  <Input placeholder="Adresa linia 1" className="mt-2" />
                  <Input placeholder="Adresa linia 2" className="mt-2" />
                  <div className="flex space-x-2 mt-2">
                    <Input placeholder="Oraș" className="flex-1" />
                    <Input placeholder="Cod poștal" className="w-28" />
                  </div>
                </div>
              )}

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
                Plătește acum
              </Button>

              <div className="text-xs text-center text-gray-500 mt-4">
                PayLinks • Termeni • Confidențialitate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
