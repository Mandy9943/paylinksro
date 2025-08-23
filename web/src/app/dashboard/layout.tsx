"use client";
import CreatePaymentLinkModal from "@/components/dashboard/create-payment-link-modal";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useStripeAccount } from "@/hooks/useStripeAccount";
import { captureTokenFromHash } from "@/lib/api";
import { Loader, Menu, Plus } from "lucide-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, onboarded } = useAuth();
  const { isOnboarded, isLoading: isStripeLoading } = useStripeAccount();
  const [bootstrapped, setBootstrapped] = useState(false);

  // Ensure we capture token from URL fragment before auth check
  useEffect(() => {
    captureTokenFromHash();
    setBootstrapped(true);
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
    affiliate: "Program de Afiliere",
    payouts: "Plăți",
    settings: "Setări",
  };

  const activeSection = useMemo(() => {
    if (!pathname) return "payment-links";
    const match = pathname.match(/\/dashboard(?:\/(\w+))?/);
    const sub = match?.[1] ?? "payment-links";
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

  // Require Stripe onboarding completion to access dashboard; route to standalone onboarding
  const allow = onboarded || isOnboarded;
  if (!isStripeLoading && !allow && activeSection !== "settings") {
    redirect("/onboarding");
  }

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
                  <span className="font-semibold">1,245.67 RON</span>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-3 py-1.5 h-8 text-sm font-medium rounded-lg border-0 transition-all duration-200 hover:shadow-md disabled:opacity-60"
                onClick={() => setShowCreateModal(true)}
                disabled={false}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Nou
              </Button>
            </div>
          </div>
          {/* {onboarded === false && (
            <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Trebuie să finalizezi onboarding-ul Stripe înainte de a crea
              link-uri de plată. Vei fi redirecționat la configurare.
            </div>
          )} */}
        </header>

        {/* Section Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      <CreatePaymentLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Layout;
