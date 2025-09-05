"use client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { clearToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  CreditCard,
  Gift,
  Link,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeSection: string;
  user?: {
    id: string;
    email: string;
    role?: "USER" | "ADMIN";
    companyName?: string | null;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const baseMenuItems = [
  { id: "payment-links", label: "Link-uri de plată", icon: Link },
  { id: "transactions", label: "Tranzacții", icon: CreditCard },
  { id: "customers", label: "Clienți", icon: Users },
  { id: "analytics", label: "Analiză", icon: BarChart3 },
  { id: "purchases", label: "Achiziții", icon: CreditCard },
  { id: "affiliate", label: "Afiliere", icon: Gift },
  { id: "payouts", label: "Plăți", icon: Building2 },
  { id: "settings", label: "Setări", icon: Settings },
];

export default function Sidebar({
  activeSection,
  user,
  isOpen,
  onToggle,
}: SidebarProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const menuItems = (() => {
    const items = [...baseMenuItems];
    if (user?.role === "ADMIN") {
      items.push({ id: "admin/payouts", label: "Admin", icon: Shield });
    }
    return items;
  })();

  const handleLogout = async () => {
    try {
      clearToken();
    } finally {
      router.replace("/");
    }
  };

  const toHref = (id: string) =>
    id === "payment-links" ? "/dashboard" : `/dashboard/${id}`;

  return (
    <>
      {/* Overlay for mobile */}
    {isOpen && (
        <div
      className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-60 bg-white/95 backdrop-blur-md shadow-xl border-r border-slate-200/60 z-40 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2.5 py-1 rounded-lg font-bold text-base">
              PayLinks
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 h-7 w-7 p-0 rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    router.push(toHref(item.id));
                    // Auto-close only on mobile to avoid collapsing the sidebar on desktop
                    if (isOpen && isMobile) onToggle();
                  }}
                  className={cn(
                    "w-full justify-start h-9 px-3 text-sm font-medium transition-all duration-200 rounded-lg border-0",
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2.5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-3 py-3 border-t border-slate-200/60">
            <div className="flex items-center mb-2 px-2 py-2 rounded-lg bg-slate-50/50">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="ml-2.5 flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 rounded-lg"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Deconectează-te
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
