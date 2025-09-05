import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";

export async function getUserSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
    });
  }
  return settings;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<{
    autoPayouts: boolean;
    payoutInterval: "daily" | "weekly" | "monthly" | "manual";
    emailNotifications: boolean;
    bankIban: string;
    bankAccountName: string;
    bankName: string;
  }>
) {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  // Try to sync Stripe payout schedule if autoPayouts or payoutInterval changed
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });
    const accountId = user?.stripeAccountId;
    if (accountId) {
      // Determine desired interval on Stripe
      const auto = settings.autoPayouts;
      const pref = settings.payoutInterval;
      let desired: "daily" | "weekly" | "monthly" | "manual";
      if (!auto) desired = "manual";
      else {
        // When enabling auto, default to daily unless a non-manual preference is set
        desired = pref && pref !== "manual" ? pref : "daily";
      }
      const stripe = getStripe();
      await stripe.accounts.update(accountId, {
        settings: { payouts: { schedule: { interval: desired } } },
      } as any);
    }
  } catch {
    // Best-effort; ignore errors so UI save still succeeds
  }
  return settings;
}
