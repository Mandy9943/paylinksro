import { addMinutes, isBefore } from "date-fns";
import { URL } from "node:url";
import { env } from "../../config/env.js";
import { randomToken, sha256 } from "../../lib/crypto.js";
import { signJwt } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { sendMail } from "../../services/mailer.js";

const MAGIC_LINK_TTL_MINUTES = 15;

export async function createShortLivedLoginToken(
  email: string,
  ttlMinutes = 60 * 24
) {
  const normalizedEmail = email.toLowerCase().trim();
  // Ensure user exists
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    // Assign affiliate code on first create
    const code = await generateUniqueAffiliateCode();
    user = await prisma.user.create({
      data: { email: normalizedEmail, active: true, affiliateCode: code },
    });
  } else if (!user.affiliateCode) {
    // Backfill affiliate code if missing
    const code = await generateUniqueAffiliateCode();
    user = await prisma.user.update({
      where: { id: user.id },
      data: { affiliateCode: code },
    });
  }
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = addMinutes(new Date(), ttlMinutes);
  await prisma.magicLinkToken.create({
    data: { userId: user.id, email: normalizedEmail, tokenHash, expiresAt },
  });
  return token;
}

export async function requestMagicLink(
  email: string,
  redirectTo?: string,
  refCode?: string
) {
  const normalizedEmail = email.toLowerCase().trim();

  // Ensure user exists (create on first request)
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  let createdNew = false;
  if (!user) {
    const code = await generateUniqueAffiliateCode();
    user = await prisma.user.create({
      data: { email: normalizedEmail, active: false, affiliateCode: code },
    });
    createdNew = true;
  } else if (!user.affiliateCode) {
    // Backfill affiliate code for existing users
    const code = await generateUniqueAffiliateCode();
    user = await prisma.user.update({
      where: { id: user.id },
      data: { affiliateCode: code },
    });
  }

  // Attempt referral attribution only on first user creation and valid refCode
  if (createdNew && refCode && user) {
    try {
      const affiliate = await prisma.user.findFirst({
        where: { affiliateCode: refCode },
        select: { id: true },
      });
      if (affiliate && affiliate.id !== user.id) {
        await prisma.referral.create({
          data: {
            affiliateUserId: affiliate.id,
            referredUserId: user.id,
            refCode,
            attributedAt: new Date(),
          },
        });
      }
    } catch {
      // ignore referral creation errors (e.g., unique constraint if retried)
    }
  }

  // Generate token and store hash
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = addMinutes(new Date(), MAGIC_LINK_TTL_MINUTES);

  await prisma.magicLinkToken.create({
    data: {
      userId: user.id,
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    },
  });

  const verifyUrl = new URL("/api/v1/auth/verify", env.API_ORIGIN);
  verifyUrl.searchParams.set("token", token);
  // Only include redirectTo if it matches APP_ORIGIN origin to prevent open redirect
  if (redirectTo) {
    try {
      const r = new URL(redirectTo);
      const appOrigin = new URL(env.APP_ORIGIN);
      if (r.origin === appOrigin.origin) {
        verifyUrl.searchParams.set("redirectTo", r.toString());
        verifyUrl.searchParams.set("redirectToAfterAuth", "/dashboard");
      }
    } catch {
      throw new Error("Invalid redirect URL");
    }
  } else {
    throw Object.assign(new Error("Invalid redirect URL"), { status: 400 });
  }

  await sendMail({
    to: normalizedEmail,
    subject: "Link de autentificare",
    html: `
      <p>Apasă pe linkul de mai jos pentru a te autentifica. Acest link expiră în ${MAGIC_LINK_TTL_MINUTES} minute.</p>
      <p><a href="${verifyUrl.toString()}">Autentifică-te</a></p>
      <p style="color:#6b7280;font-size:12px;">Dacă nu ai solicitat acest email, îl poți ignora în siguranță.</p>
    `.trim(),
  });

  if (env.NODE_ENV !== "production") {
    return { ok: true, debug: { token, url: verifyUrl.toString() } };
  }

  return { ok: true };
}

// Generate a short unique affiliate code (hex), retried on rare collisions
async function generateUniqueAffiliateCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = randomToken(6); // 12 hex chars
    const existing = await prisma.user.findFirst({
      where: { affiliateCode: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  // Fallback to longer code if repeated collisions
  return randomToken(12);
}

export async function verifyMagicLink(token: string) {
  const tokenHash = sha256(token);

  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
  });
  if (!record) throw Object.assign(new Error("Invalid token"), { status: 400 });
  if (record.usedAt)
    throw Object.assign(new Error("Token already used"), { status: 400 });
  if (isBefore(record.expiresAt, new Date()))
    throw Object.assign(new Error("Token expired"), { status: 400 });

  // Mark used
  await prisma.magicLinkToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { active: true },
  });

  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  // Create session (simple JWT-based session for API usage)
  const sessionJwt = signJwt({ sub: record.userId, ver: user.tokenVersion });

  return { token: sessionJwt };
}
