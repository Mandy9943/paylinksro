"use client";
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
import { Monitor, Smartphone } from "lucide-react";
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

  const totalDueLabel = () => {
    if (type === "fundraising") return "Enter amount below";
    if (priceType === "fixed") return `RON ${amount ?? 0}`;
    if (minAmount && minAmount > 0) return `RON ${minAmount}+`;
    return "La completarea formularului";
  };

  return (
    <div className="w-1/2 bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Previzualizare</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              className="p-1"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              className="p-1"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          🔗 paylink.ro/p/demo-link
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-sm border ${
          previewMode === "mobile" ? "max-w-sm mx-auto" : "max-w-4xl mx-auto"
        }`}
      >
        <div className={`${previewMode === "desktop" ? "flex" : ""}`}>
          <div
            className={`${previewMode === "desktop" ? "w-1/2" : ""} p-6 ${
              previewMode === "mobile" ? "rounded-t-lg" : "rounded-l-lg"
            }`}
            style={{ backgroundColor: mainColor }}
          >
            {(productCoverImageUrl ||
              (type === "fundraising" && fundraisingCoverImageUrl)) && (
              <div className="mb-4 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    (type === "fundraising"
                      ? fundraisingCoverImageUrl
                      : productCoverImageUrl) || ""
                  }
                  alt="Cover"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">
                {name ||
                  (type === "servicii"
                    ? "Serviciul tău"
                    : type === "produse-digitale"
                    ? "Produsul tău digital"
                    : type === "donatii"
                    ? "Donația ta"
                    : "Your Fundraising Campaign")}
              </span>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-700 mb-2">
                {type === "servicii"
                  ? `Plătește ${name || "Serviciul"}`
                  : type === "produse-digitale"
                  ? `Cumpără ${name || "Produsul Digital"}`
                  : type === "donatii"
                  ? `Donează pentru ${name || "Cauza"}`
                  : `Support ${name || "Our Campaign"}`}
              </div>
              {description && (
                <div className="text-xs text-gray-600 mb-4 px-2">
                  {description}
                </div>
              )}

              {type === "fundraising" && (
                <div className="mb-4 px-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Raised</span>
                    <span className="text-xs text-gray-600">
                      {Math.min(
                        100,
                        (currentRaised / (targetAmount || 1)) * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
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
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">
                      {currentRaised} RON raised
                    </span>
                    <span className="text-gray-600">of {targetAmount} RON</span>
                  </div>
                </div>
              )}
              <div className="text-2xl font-bold text-gray-900 mb-6">
                {type === "fundraising"
                  ? "Any amount"
                  : priceType === "flexible"
                  ? minAmount && minAmount > 0
                    ? `RON ${minAmount}+`
                    : "Sumă la alegere"
                  : `RON ${amount ?? 0}`}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    {name ||
                      (type === "fundraising"
                        ? "Campaign support"
                        : "Nume produs")}
                  </span>
                  <span>
                    {type === "fundraising"
                      ? "Any amount"
                      : priceType === "flexible"
                      ? minAmount && minAmount > 0
                        ? `RON ${minAmount}+`
                        : "Sumă la alegere"
                      : `RON ${amount ?? 0}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {type === "fundraising"
                      ? "Enter amount below"
                      : priceType === "flexible"
                      ? minAmount && minAmount > 0
                        ? `RON ${minAmount}+`
                        : "Sumă la alegere"
                      : `RON ${amount ?? 0}`}
                  </span>
                </div>
                {type === "fundraising" ? (
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total due</span>
                    <span>Enter amount below</span>
                  </div>
                ) : priceType === "fixed" ? (
                  <>
                    {addVat && (
                      <div className="flex justify-between">
                        <span>TVA</span>
                        <span>21%</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total due</span>
                      <span>
                        RON{" "}
                        {addVat
                          ? ((amount ?? 0) * 1.21).toFixed(2)
                          : amount ?? 0}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total due</span>
                    <span>{totalDueLabel()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

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

              <div>
                <Label className="text-xs text-gray-600">Metodă de plată</Label>
                <div className="mt-1 p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Informații card</span>
                    <div className="flex space-x-1">
                      <div className="w-6 h-4 bg-blue-600 rounded" />
                      <div className="w-6 h-4 bg-red-500 rounded" />
                      <div className="w-6 h-4 bg-yellow-500 rounded" />
                    </div>
                  </div>
                  <Input
                    placeholder="1234 1234 1234 1234"
                    className="mt-2 text-sm border-0 bg-transparent p-0"
                  />
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="MM / YY"
                      className="text-sm border-0 bg-transparent p-0 flex-1"
                    />
                    <Input
                      placeholder="CVC"
                      className="text-sm border-0 bg-transparent p-0 w-16"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Numele deținătorului cardului
                </Label>
                <Input
                  placeholder="Numele complet de pe card"
                  className="mt-1"
                />
              </div>

              {collectBillingAddress && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Adresa de facturare
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="România" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">România</SelectItem>
                      <SelectItem value="us">Statele Unite</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Adresa linia 1" className="mt-2" />
                  <Input placeholder="Adresa linia 2" className="mt-2" />
                  <div className="flex space-x-2 mt-2">
                    <Input placeholder="Oraș" className="flex-1" />
                    <Input placeholder="Cod poștal" className="w-20" />
                  </div>
                </div>
              )}

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
                {type === "fundraising"
                  ? "Donează acum"
                  : priceType === "fixed"
                  ? `Plătește ${
                      addVat ? ((amount ?? 0) * 1.21).toFixed(2) : amount ?? 0
                    } RON acum`
                  : addVat
                  ? "Plătește + 21% TVA acum"
                  : "Plătește acum"}
              </Button>

              <div className="text-xs text-center text-gray-500 mt-4">
                Powered by PayLink • Termeni • Confidențialitate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
