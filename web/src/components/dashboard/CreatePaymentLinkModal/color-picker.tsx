"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import type { CreatePaymentLinkFormValues } from "./types";

const COLORS = [
  { color: "#fbbf24", name: "Galben" },
  { color: "#3b82f6", name: "Albastru" },
  { color: "#10b981", name: "Verde" },
  { color: "#f59e0b", name: "Portocaliu" },
  { color: "#ef4444", name: "Roșu" },
  { color: "#8b5cf6", name: "Violet" },
  { color: "#ec4899", name: "Roz" },
  { color: "#6b7280", name: "Gri" },
];

export function ColorPicker() {
  const { control } = useFormContext<CreatePaymentLinkFormValues>();

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Culoare de fundal
      </h3>
      <Controller
        name="mainColor"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((option) => (
                <button
                  key={option.color}
                  type="button"
                  onClick={() => field.onChange(option.color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    field.value === option.color
                      ? "border-gray-900 shadow-md"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: option.color }}
                  title={option.name}
                />
              ))}
            </div>
            <div className="mt-3">
              <Label
                htmlFor="custom-color"
                className="text-sm font-medium text-gray-700"
              >
                Sau alege o culoare personalizată
              </Label>
              <div className="flex items-center space-x-3 mt-1">
                <input
                  id="custom-color"
                  type="color"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="#fbbf24"
                  className="w-32 text-sm"
                />
              </div>
            </div>
          </>
        )}
      />
    </div>
  );
}
