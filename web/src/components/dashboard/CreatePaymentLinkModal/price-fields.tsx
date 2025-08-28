"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreatePaymentLinkFormValues } from "./types";

export function PriceFields() {
  const { control } = useFormContext<CreatePaymentLinkFormValues>();
  const type = useWatch({ control, name: "type" });
  const priceType = useWatch({ control, name: "priceType" });

  if (type === "fundraising") return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Preț</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Controller
            name="priceType"
            control={control}
            render={({ field }) => (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fixed-price"
                    name="priceType"
                    value="fixed"
                    checked={field.value === "fixed"}
                    onChange={() => field.onChange("fixed")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="fixed-price" className="text-sm">
                    Preț fix
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="flexible-price"
                    name="priceType"
                    value="flexible"
                    checked={field.value === "flexible"}
                    onChange={() => field.onChange("flexible")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="flexible-price" className="text-sm">
                    Permite clienților să aleagă suma
                  </Label>
                </div>
              </>
            )}
          />
        </div>

        {priceType === "fixed" && (
          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-700"
                >
                  Suma (RON)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full mt-1"
                  value={field.value ?? ""}
                  aria-invalid={!!fieldState.error}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
                {fieldState.error && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        )}

        {priceType === "flexible" && (
          <Controller
            name="minAmount"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Label
                  htmlFor="minAmount"
                  className="text-sm font-medium text-gray-700"
                >
                  Suma minimă (RON) - opțional
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full mt-1"
                  value={field.value ?? ""}
                  aria-invalid={!!fieldState.error}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lasă gol pentru a permite orice sumă
                </p>
                {fieldState.error && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
