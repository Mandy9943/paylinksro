import { api } from "@/lib/api";

// Simple API wrappers for auth
export async function requestMagicLink(
  email: string,
  redirectTo?: string,
  refCode?: string | null
) {
  const target = redirectTo ?? `${window.location.origin}/auth/callback`;
  const payload: Record<string, unknown> = { email, redirectTo: target };
  if (refCode && refCode.trim().length > 0) payload.refCode = refCode.trim();
  const res = await api.post("/v1/auth/request", payload);
  return res.data as { ok: boolean };
}

export type User = { id: string; email: string; role: "USER" | "ADMIN" };
export async function getMe() {
  const res = await api.get("/v1/me");
  return res.data as { user: User };
}
