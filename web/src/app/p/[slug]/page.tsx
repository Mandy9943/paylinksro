import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import CopyUrlBar from "./CopyUrlBar";
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
  addVat?: boolean | null;
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

  const mainColor = data.mainColor || "#fbbf24"; // yellow fallback like the design
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
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      {/* URL bar with copy action */}
      <CopyUrlBar slug={slug} />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Left - Service/Product card */}
          <div
            className="rounded-lg p-4 md:p-6 text-black border-0 shadow-sm"
            style={{ backgroundColor: mainColor }}
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
                    {name}
                  </h1>
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
                      {type === "servicii"
                        ? "Sesiune de consultanță online"
                        : name}
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
              {type === "fundraising" && (
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

              {/* Summary / Preview (keeps existing logic via PayLinkPreview) */}
              <div className="bg-black/10 rounded-lg p-3 md:p-4 space-y-3">
                <div className="text-center mb-3 md:mb-4">
                  <div className="text-2xl md:text-3xl font-bold text-black">
                    {amount ? `RON ${amount.toFixed(2)}` : ""}
                  </div>
                </div>

                {/* Live preview synced with amount selected in PayWidget */}
                <PayLinkPreview
                  slug={slug}
                  type={type}
                  priceType={priceType}
                  amount={amount}
                  minAmount={minAmount}
                  name={name}
                  addVat={!!data.addVat}
                />
              </div>
            </div>
          </div>

          {/* Right - Payment form wrapper (Stripe Elements inside PayWidget remain unchanged) */}
          <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
            <div className="space-y-4 md:space-y-6">
              {!sellerOnboarded && (
                <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-sm px-3 py-2">
                  Momentan acest comerciant nu poate accepta plăți. Revino mai
                  târziu.
                </div>
              )}

              <div aria-disabled={!sellerOnboarded}>
                {sellerOnboarded ? (
                  <PayWidget
                    slug={slug}
                    priceType={priceType}
                    minAmount={minAmount}
                    requireEmail={collectEmail}
                    requirePhone={collectPhone}
                    requireBilling={collectBillingAddress}
                    addVat={!!data.addVat}
                  />
                ) : (
                  <div className="h-24 flex items-center justify-center rounded-md border border-dashed border-amber-300 bg-amber-50 text-amber-900 text-sm">
                    Plățile nu sunt disponibile pentru acest link momentan.
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Securizat prin PayLink • Termeni • Confidențialitate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
