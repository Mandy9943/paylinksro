"use client";

// Utilities for handling referral codes on the client

const REF_COOKIE = "pl_ref";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  // samesite=lax ensures it’s sent on top-level navigations only; secure only on https
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function getRefFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  return ref && ref.trim().length > 0 ? ref.trim() : null;
}

export function rememberRefFromUrl() {
  const ref = getRefFromUrl();
  if (ref) setCookie(REF_COOKIE, ref, COOKIE_MAX_AGE);
}

export function getRefCodeForAuth(): string | null {
  // Last click wins: if URL contains ?ref=, overwrite cookie and return that
  const fromUrl = getRefFromUrl();
  if (fromUrl) {
    setCookie(REF_COOKIE, fromUrl, COOKIE_MAX_AGE);
    return fromUrl;
  }
  // Fallback to cookie if present
  const fromCookie = getCookie(REF_COOKIE);
  return fromCookie ? decodeURIComponent(fromCookie) : null;
}
