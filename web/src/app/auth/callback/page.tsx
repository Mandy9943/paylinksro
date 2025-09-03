"use client";
import { captureTokenFromHash } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function resolveSafeRedirect(redirectTo: string | null): string | null {
    if (!redirectTo) return null;

    // Disallow protocol-relative URLs (//example.com)
    if (redirectTo.startsWith("//")) return null;

    // Allow simple relative paths
    if (redirectTo.startsWith("/")) return redirectTo;

    // For absolute URLs, only allow same-origin
    try {
      const target = new URL(redirectTo, window.location.origin);
      if (target.origin !== window.location.origin) return null;
      return `${target.pathname}${target.search}${target.hash}`;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    captureTokenFromHash();
    console.log(window.location.href);

    const requested = searchParams.get("redirectTo");

    const safe = resolveSafeRedirect(requested);
    const target = safe || "/dashboard";
    console.log("Redirecting to:", target);

    router.replace(target);
  }, [router, searchParams]);

  return null;
}

export default function page() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
