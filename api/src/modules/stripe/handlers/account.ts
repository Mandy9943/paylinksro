import { prisma } from "../../../lib/prisma.js";

export async function onAccountUpdated(event: any) {
  const account = event.data.object as {
    id: string;
    controller?: any;
    details_submitted?: boolean;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
  };
  const user = await prisma.user.findFirst({
    where: { stripeAccountId: account.id },
    select: { id: true },
  });
  if (!user) return;

  const isOnboarded = !!(
    account.details_submitted || (account as any).charges_enabled
  );
  await prisma.user.update({
    where: { id: user.id },
    data: {
      onboardedAt: isOnboarded ? new Date() : undefined,
      stripeAccountStatusJson: JSON.stringify({
        details_submitted: (account as any).details_submitted,
        charges_enabled: (account as any).charges_enabled,
        payouts_enabled: (account as any).payouts_enabled,
        updated_at: new Date().toISOString(),
      }),
    },
  });
}
