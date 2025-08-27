import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PayWidget from "./PayWidget";

// Minimal type aligned with web/src/api/paylinks.ts PayLink
type PayLink = {
  id: string;
  name: string;
  slug: string;
  priceType: "FIXED" | "FLEXIBLE";
  amount?: number | null;
  minAmount?: number | null;
  currency: string;
  active: boolean;
  serviceType: "SERVICE" | "DIGITAL_PRODUCT" | "DONATION" | "FUNDRAISING";
  description?: string | null;
  collectEmail: boolean;
  collectPhone: boolean;
  collectBillingAddress?: boolean | null;
  mainColor?: string | null;
  sellerStripeAccountId?: string | null;
  service?: {
    title: string;
    description?: string | null;
    coverImageUrl?: string | null;
  } | null;
  product?: { coverImageUrl?: string | null } | null;
  fundraising?: {
    targetAmount?: number | null;
    currentRaised?: number | null;
    coverImageUrl?: string | null;
  } | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function fetchPayLink(slug: string): Promise<PayLink | null> {
  const res = await fetch(
    `${API_BASE}/v1/paylinks/public/${encodeURIComponent(slug)}` as string,
    {
      // We want SSR and reasonably fresh content
      next: { revalidate: 60 },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch paylink: ${res.status}`);
  const data = (await res.json()) as PayLink;
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await fetchPayLink(params.slug);
  if (!data) return { title: "PayLink" };
  const cover =
    data.fundraising?.coverImageUrl ||
    data.service?.coverImageUrl ||
    data.product?.coverImageUrl ||
    undefined;
  return {
    title: `${data.name} — PayLink`,
    description: data.description ?? undefined,
    openGraph: {
      title: `${data.name} — PayLink`,
      description: data.description ?? undefined,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: `${data.name} — PayLink`,
      description: data.description ?? undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PublicPayLinkPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await fetchPayLink(params.slug);
  if (!data) notFound();

  const mainColor = data.mainColor || "#fbbf24";
  const priceType = data.priceType || "FIXED";
  const type =
    data.serviceType === "SERVICE"
      ? ("servicii" as const)
      : data.serviceType === "DIGITAL_PRODUCT"
      ? ("produse-digitale" as const)
      : data.serviceType === "DONATION"
      ? ("donatii" as const)
      : ("fundraising" as const);

  const coverImageUrl =
    (type === "fundraising"
      ? data.fundraising?.coverImageUrl
      : data.service?.coverImageUrl || data.product?.coverImageUrl) || "";

  const amount = data.amount ?? 0;
  const minAmount = data.minAmount ?? null;
  const description = data.description ?? "";
  const name = data.name ?? "";
  const collectEmail = !!data.collectEmail;
  const collectPhone = !!data.collectPhone;
  const collectBillingAddress = !!data.collectBillingAddress;
  const targetAmount = data.fundraising?.targetAmount ?? 0;
  const currentRaised = data.fundraising?.currentRaised ?? 0;

  const totalDueLabel = () => {
    if (type === "fundraising") return "Enter amount below";
    if (priceType === "FIXED") return `RON ${amount ?? 0}`;
    if (minAmount && minAmount > 0) return `RON ${minAmount}+`;
    return "La completarea formularului";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs text-gray-500 mb-4">
          🔗 paylink.ro/p/{params.slug}
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row">
            <div
              className="md:w-1/2 p-6 rounded-t-lg md:rounded-l-lg"
              style={{ backgroundColor: mainColor }}
            >
              {coverImageUrl && (
                <div className="mb-4 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">{name}</span>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-700 mb-2">
                  {type === "servicii"
                    ? `Plătește ${name}`
                    : type === "produse-digitale"
                    ? `Cumpără ${name}`
                    : type === "donatii"
                    ? `Donează pentru ${name}`
                    : `Support ${name}`}
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
                      <span className="text-gray-600">
                        of {targetAmount} RON
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-2xl font-bold text-gray-900 mb-6">
                  {type === "fundraising"
                    ? "Any amount"
                    : priceType === "FLEXIBLE"
                    ? minAmount && minAmount > 0
                      ? `RON ${minAmount}+`
                      : "Sumă la alegere"
                    : `RON ${amount ?? 0}`}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{name}</span>
                    <span>
                      {type === "fundraising"
                        ? "Any amount"
                        : priceType === "FLEXIBLE"
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
                        : priceType === "FLEXIBLE"
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
                      <span>{totalDueLabel()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-6">
              <div className="space-y-4">
                {priceType === "FLEXIBLE" && (
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
                  <Label className="text-xs text-gray-600">
                    Metodă de plată
                  </Label>
                  <div className="mt-2">
                    <PayWidget
                      slug={params.slug}
                      priceType={priceType}
                      minAmount={minAmount}
                    />
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

                {/* The PayWidget contains the pay button */}

                <div className="text-xs text-center text-gray-500 mt-4">
                  Powered by PayLink • Termeni • Confidențialitate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
