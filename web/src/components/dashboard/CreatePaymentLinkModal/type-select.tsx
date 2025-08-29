"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFormContext } from "react-hook-form";
import type { CreatePaymentLinkFormValues, PaymentLinkType } from "./types";

export function TypeSelect() {
  const { control } = useFormContext<CreatePaymentLinkFormValues>();

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Selectează tipul
      </h3>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(v: PaymentLinkType) => field.onChange(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Alege tipul" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="servicii">Servicii</SelectItem>
              <SelectItem value="produse-digitale">Produse Digitale</SelectItem>
              <SelectItem value="donatii">Donații</SelectItem>
              <SelectItem value="fundraising">Raise funds</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
