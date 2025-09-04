"use client";
import CreatePaymentLinkModal from "@/components/dashboard/CreatePaymentLinkModal/create-payment-link-modal";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { useBalance } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { usePayLinks } from "@/hooks/usePayLinks";
import { useStripeAccount } from "@/hooks/useStripeAccount";
import { captureTokenFromHash } from "@/lib/api";
import useUiStore from "@/store/ui-store";
import { AlertCircle, Loader, Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isLoading: isStripeLoading, isOnboarded } = useStripeAccount();
  const { data: balance } = useBalance();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [createdLinkFlag, setCreatedLinkFlag] = useState(false);
  const { openCreatePaymentLinkModal, toggleCreatePaymentLinkModal } =
    useUiStore();
  const { items: paylinks } = usePayLinks();

  // Ensure we capture token from URL fragment before auth check
  useEffect(() => {
    captureTokenFromHash();
    setBootstrapped(true);
  }, []);

  // Restore banner visibility from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("onboardingBannerDismissed");
    setShowOnboardingBanner(dismissed !== "1");
    const created = localStorage.getItem("hasCreatedPayLink");
    setCreatedLinkFlag(created === "1");
  }, []);

  useEffect(() => {
    if (bootstrapped && !isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [bootstrapped, isAuthenticated, isLoading, router]);

  const sectionTitles: Record<string, string> = {
    "payment-links": "Link-uri de plată",
    transactions: "Tranzacții",
    customers: "Clienți",
    analytics: "Analiză",
    purchases: "Achizițiile mele",
    affiliate: "Program de Afiliere",
    payouts: "Plăți",
    settings: "Setări",
    "admin/payouts": "Admin — Payouts",
  };

  const activeSection = useMemo(() => {
    if (!pathname) return "payment-links";
    const match = pathname.replace(/^\/?/, "").split("/");
    // e.g., ["dashboard", "admin", "payouts"]
    if (match[1] === "admin") {
      return "admin/payouts";
    }
    const sub = match[1] ?? "payment-links";
    return sub as keyof typeof sectionTitles as string;
  }, [pathname]);
  // Prevent flashing private content: show nothing until auth is determined
  if (!bootstrapped || isLoading || isStripeLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // No blocking: users can navigate without completing onboarding

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeSection={activeSection}
        user={user ?? undefined}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 h-8 w-8 p-0 rounded-lg"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold text-slate-900">
                {sectionTitles[activeSection]}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
                <div className="text-xs font-medium">
                  Sold disponibil:{" "}
                  <span className="font-semibold">
                    {balance
                      ? `${(balance.available + balance.pending).toFixed(2)} ${
                          balance.currency
                        }`
                      : "0.00 RON"}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-3 py-1.5 h-8 text-sm font-medium rounded-lg border-0 transition-all duration-200 hover:shadow-md disabled:opacity-60"
                onClick={() => toggleCreatePaymentLinkModal()}
                disabled={false}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Nou
              </Button>
            </div>
          </div>
          {!isOnboarded &&
            showOnboardingBanner &&
            (createdLinkFlag || (paylinks?.length ?? 0) > 0) && (
              <div className="mt-3">
                <div className="relative flex items-center gap-3 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="flex-1 text-sm font-medium tracking-wide">
                    PENTRU A ÎNCEPE SĂ ACCEPȚI PLĂȚI, AVEM NEVOIE DE MAI MULTE
                    INFORMAȚII.
                  </div>
                  <Link
                    href="/dashboard/settings#onboarding"
                    className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                  >
                    Configurează plățile
                  </Link>
                  <button
                    aria-label="Închide"
                    className="absolute right-2 top-2 text-amber-700/70 hover:text-amber-900"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("onboardingBannerDismissed", "1");
                      }
                      setShowOnboardingBanner(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
        </header>

        {/* Section Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
      {openCreatePaymentLinkModal && (
        <CreatePaymentLinkModal
          isOpen={openCreatePaymentLinkModal}
          onClose={toggleCreatePaymentLinkModal}
        />
      )}
    </div>
  );
};

export default Layout;
