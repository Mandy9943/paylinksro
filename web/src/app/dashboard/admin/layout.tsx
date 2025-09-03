"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Wait one tick to allow parent dashboard layout to capture token etc.
    const id = setTimeout(() => setBootstrapped(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!bootstrapped || isLoading) return;
    if (!user || user.role !== "ADMIN") {
      // Not an admin: kick back to dashboard home
      router.replace("/dashboard");
    }
  }, [bootstrapped, isLoading, user, router, pathname]);

  if (!bootstrapped || isLoading) return null;
  if (!user || user.role !== "ADMIN") return null;
  return <>{children}</>;
}
