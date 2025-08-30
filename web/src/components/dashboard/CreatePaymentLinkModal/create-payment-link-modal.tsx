"use client";
import { createPayLink } from "@/api/paylinks";
import { Button } from "@/components/ui/button";
import { usePayLinks } from "@/hooks/usePayLinks";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { ColorPicker } from "./color-picker";
import { OptionsFields } from "./options-fields";
import { PreviewPane } from "./preview-pane";
import { PriceFields } from "./price-fields";
import { ProductFields } from "./product-fields";
import { createPaymentLinkSchema } from "./schema";
import { TypeSelect } from "./type-select";
import type { CreatePaymentLinkFormValues } from "./types";

interface CreatePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePaymentLinkModal({
  isOpen,
  onClose,
}: CreatePaymentLinkModalProps) {
  const { mutate } = usePayLinks();
  const defaultValues: CreatePaymentLinkFormValues = {
    type: "servicii",
    name: "",
    description: "",
    priceType: "fixed",
    amount: 0,
    minAmount: null,
    collectEmail: true,
    collectPhone: false,
    collectBillingAddress: false,
    mainColor: "#fbbf24",
    productAssetUrls: [],
    productCoverImageUrl: null,
    fundraisingCoverImageUrl: null,
    targetAmount: 1000,
  };
  const form = useForm<CreatePaymentLinkFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(
      createPaymentLinkSchema
    ) as unknown as Resolver<CreatePaymentLinkFormValues>,
  });

  type CreateInput = Parameters<typeof createPayLink>[0];
  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (values) => {
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, 60);

    const serviceTypeMap = {
      servicii: "SERVICE",
      "produse-digitale": "DIGITAL_PRODUCT",
      donatii: "DONATION",
      fundraising: "FUNDRAISING",
    } as const;

    const priceTypeMap = { fixed: "FIXED", flexible: "FLEXIBLE" } as const;

    const slugBase = values.name || "link";
    const payload: CreateInput = {
      name: values.name,
      slug: slugify(slugBase),
      priceType: priceTypeMap[values.priceType],
      amount: values.priceType === "fixed" ? values.amount ?? 0 : undefined,
      minAmount:
        values.priceType === "flexible" && values.minAmount != null
          ? values.minAmount
          : undefined,
      serviceType: serviceTypeMap[values.type],
      description: values.description || undefined,
      collectEmail: values.collectEmail,
      collectPhone: values.collectPhone,
      collectBillingAddress: values.collectBillingAddress,
      mainColor: values.mainColor,
    };

    if (values.type === "servicii") {
      payload.service = {
        title: values.name,
        description: values.description || undefined,
        coverImageUrl: values.productCoverImageUrl || undefined,
      };
    } else if (values.type === "produse-digitale") {
      payload.product = {
        name: values.name,
        description: values.description || undefined,
        assets: values.productAssetUrls?.length
          ? values.productAssetUrls
          : undefined,
        coverImageUrl: values.productCoverImageUrl || undefined,
      };
    } else if (values.type === "fundraising") {
      payload.fundraising = {
        targetAmount: values.targetAmount ?? undefined,
        coverImageUrl: values.fundraisingCoverImageUrl || undefined,
      };
    }

    try {
      await createPayLink(payload);
      mutate();
      // Reset the form so the modal starts fresh next time it's opened
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("hasCreatedPayLink", "1");
        } catch {}
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] md:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium text-gray-900">
              Creează un link de plată
            </h2>
          </div>
          <Button
            form="create-payment-link-form"
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            disabled={!form.formState.isValid}
          >
            Creează link
          </Button>
        </div>
        <FormProvider {...form}>
          <form
            id="create-payment-link-form"
            onSubmit={form.handleSubmit(onSubmit, () => {})}
            className="flex flex-1 overflow-hidden"
          >
            {/* Left Panel - Form */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              {form.formState.isSubmitted && !form.formState.isValid && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2">
                  Verifică câmpurile evidențiate mai jos.
                </div>
              )}
              <TypeSelect />
              <ProductFields />
              <OptionsFields />
              <PriceFields />
              <ColorPicker />
            </div>
            {/* Right Panel - Preview */}
            <PreviewPane />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
