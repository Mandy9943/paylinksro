import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PayLinkPreview from "./PayLinkPreview";
import PayWidget from "./PayWidget";
export const runtime = "edge";
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
  sellerOnboarded?: boolean;
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const data = await fetchPayLink((await params).slug);
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
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  const data = await fetchPayLink(slug);

  if (!data) notFound();
  const sellerOnboarded = !!data.sellerOnboarded;

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

  // Preview amount is driven by client component and PayWidget events

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs text-gray-500 mb-4">🔗 paylink.ro/p/{slug}</div>
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

                {/* Live preview synced with amount selected in PayWidget */}
                <PayLinkPreview
                  slug={slug}
                  type={type}
                  priceType={priceType}
                  amount={amount}
                  minAmount={minAmount}
                  name={name}
                />
              </div>
            </div>

            <div className="md:w-1/2 p-6">
              <div className="space-y-4">
                {!sellerOnboarded && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-sm px-3 py-2">
                    Momentan acest comerciant nu poate accepta plăți. Revino mai
                    târziu.
                  </div>
                )}

                <div aria-disabled={!sellerOnboarded}>
                  <div className="mt-2">
                    {sellerOnboarded ? (
                      <PayWidget
                        slug={slug}
                        priceType={priceType}
                        minAmount={minAmount}
                        requireEmail={collectEmail}
                        requirePhone={collectPhone}
                        requireBilling={collectBillingAddress}
                      />
                    ) : (
                      <div className="h-24 flex items-center justify-center rounded-md border border-dashed border-amber-300 bg-amber-50 text-amber-900 text-sm">
                        Plățile nu sunt disponibile pentru acest link momentan.
                      </div>
                    )}
                  </div>
                </div>

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
