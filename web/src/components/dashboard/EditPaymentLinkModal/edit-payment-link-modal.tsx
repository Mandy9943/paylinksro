"use client";
import { revalidatePaymentLink } from "@/actions/revalidate-paymentlink-action";
import type { PayLink } from "@/api/paylinks";
import { updatePayLink, type UpdatePayLinkInput } from "@/api/paylinks";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { OptionsFields } from "../CreatePaymentLinkModal/options-fields";
import { PreviewPane } from "../CreatePaymentLinkModal/preview-pane";
import { PriceFields } from "../CreatePaymentLinkModal/price-fields";
import { ProductFields } from "../CreatePaymentLinkModal/product-fields";
import { createPaymentLinkSchema } from "../CreatePaymentLinkModal/schema";
import { TypeSelect } from "../CreatePaymentLinkModal/type-select";
import type { CreatePaymentLinkFormValues } from "../CreatePaymentLinkModal/types";

interface EditPaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: PayLink | null;
  onUpdated?: (updated: PayLink) => void;
}

export default function EditPaymentLinkModal({
  isOpen,
  onClose,
  link,
  onUpdated,
}: EditPaymentLinkModalProps) {
  const mapLinkToForm = (l: PayLink | null): CreatePaymentLinkFormValues => ({
    type:
      l?.serviceType === "SERVICE"
        ? "servicii"
        : l?.serviceType === "DIGITAL_PRODUCT"
        ? "produse-digitale"
        : l?.serviceType === "DONATION"
        ? "donatii"
        : "fundraising",
    name: l?.name || "",
    description: l?.description || "",
    priceType: l?.priceType === "FIXED" ? "fixed" : "flexible",
    amount: l?.amount ?? 0,
    minAmount: l?.minAmount ?? null,
    collectEmail: !!l?.collectEmail,
    collectPhone: !!l?.collectPhone,
    collectBillingAddress: (l?.collectBillingAddress ?? false) as boolean,
    addVat: (l?.addVat ?? true) as boolean,
    mainColor: l?.mainColor || "#fbbf24",
    productAssetUrls: Array.isArray(l?.product?.assets)
      ? (l?.product?.assets as string[])
      : [],
    productCoverImageUrl: l?.product?.coverImageUrl || null,
    fundraisingCoverImageUrl: l?.fundraising?.coverImageUrl || null,
    targetAmount: l?.fundraising?.targetAmount ?? null,
  });
  const form = useForm<CreatePaymentLinkFormValues>({
    defaultValues: link
      ? mapLinkToForm(link)
      : {
          type: "servicii",
          name: "",
          description: "",
          priceType: "fixed",
          amount: 0,
          minAmount: null,
          collectEmail: true,
          collectPhone: false,
          collectBillingAddress: false,
          addVat: true,
          mainColor: "#fbbf24",
          productAssetUrls: [],
          productCoverImageUrl: null,
          fundraisingCoverImageUrl: null,
          targetAmount: 1000,
        },
    mode: "onChange",
    resolver: zodResolver(
      createPaymentLinkSchema
    ) as unknown as Resolver<CreatePaymentLinkFormValues>,
  });

  // Keep form in sync when switching between links
  useEffect(() => {
    if (!link) return;

    const values = mapLinkToForm(link);
    form.reset(values);
  }, [link, form]);

  // Explicitly set type when opening to ensure Select reflects it immediately
  useEffect(() => {
    if (!isOpen || !link) return;
    const values = mapLinkToForm(link);
    form.setValue("type", values.type, {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [isOpen, link, form]);

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (values) => {
    if (!link) return;
    const serviceTypeMap = {
      servicii: "SERVICE",
      "produse-digitale": "DIGITAL_PRODUCT",
      donatii: "DONATION",
      fundraising: "FUNDRAISING",
    } as const;

    const priceTypeMap = { fixed: "FIXED", flexible: "FLEXIBLE" } as const;

    const payload: UpdatePayLinkInput = {
      name: values.name,
      // slug stays unless we later add an explicit field
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
      addVat: values.addVat,
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

    const updated = await updatePayLink(link.id, payload);
    onUpdated?.(updated);
    revalidatePaymentLink(updated.slug);
    onClose();
  };

  if (!isOpen || !link) return null;

  return (
    <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] md:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium text-gray-900">Editează link</h2>
          </div>
          <Button
            form="edit-payment-link-form"
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            disabled={!form.formState.isValid}
          >
            Salvează
          </Button>
        </div>
        <FormProvider {...form}>
          <form
            id="edit-payment-link-form"
            key={link.id}
            onSubmit={form.handleSubmit(onSubmit, () => {})}
            className="flex flex-1 overflow-hidden"
          >
            {/* Left Panel - Form */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              <TypeSelect />
              <ProductFields />
              <OptionsFields />
              <PriceFields />
              {/* <ColorPicker /> */}
            </div>
            {/* Right Panel - Preview */}
            <PreviewPane />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
