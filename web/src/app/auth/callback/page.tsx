"use client";
import { captureTokenFromHash } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    captureTokenFromHash();
    router.replace("/dashboard");
  }, [router]);

  return null;
}
