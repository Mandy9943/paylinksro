"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import type { CreatePaymentLinkFormValues } from "./types";

export function OptionsFields() {
  const { control } = useFormContext<CreatePaymentLinkFormValues>();

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Opțiuni</h3>
      <div className="space-y-4">
        <Controller
          name="addVat"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3">
              <Checkbox
                id="addVat"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <Label htmlFor="addVat" className="text-sm">
                Adaugă Taxa TVA (21%)
              </Label>
            </div>
          )}
        />
        <Controller
          name="collectEmail"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3">
              <Checkbox
                id="collectEmail"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <Label htmlFor="collectEmail" className="text-sm">
                Colectează adresele de email ale clienților
              </Label>
            </div>
          )}
        />

        <Controller
          name="collectPhone"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3">
              <Checkbox
                id="requirePhone"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <Label htmlFor="requirePhone" className="text-sm">
                Solicită clienților să furnizeze un număr de telefon
              </Label>
            </div>
          )}
        />

        <Controller
          name="collectBillingAddress"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3">
              <Checkbox
                id="collectBillingAddress"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <Label htmlFor="collectBillingAddress" className="text-sm">
                Colectează adresa de facturare a clienților
              </Label>
            </div>
          )}
        />
      </div>
    </div>
  );
}
