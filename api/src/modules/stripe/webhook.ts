import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";

// We use a single handler for Stripe webhooks. Ensure app.ts configured raw body for this path.
export async function stripeWebhookHandler(req: Request, res: Response) {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.warn("Stripe webhook secret is not set; ignoring webhook");
    return res.status(200).json({ received: true });
  }
  if (!sig) {
    return res
      .status(400)
      .json({ error: { message: "Missing stripe-signature" } });
  }
  let event: any;
  try {
    // @ts-ignore - body is a Buffer thanks to bodyParser.raw in app.ts
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    logger.warn({ err }, "Invalid Stripe signature");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as {
          id: string;
          controller?: any;
          details_submitted?: boolean;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
        };
        // Our User model stores stripeAccountId. Map back to user by that field.
        const user = await prisma.user.findFirst({
          where: { stripeAccountId: account.id },
          select: { id: true },
        });
        if (!user) break;
        console.log(account);

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
        break;
      }
      default:
        // ignore
        break;
    }
  } catch (err) {
    logger.error({ err, type: event?.type }, "Error handling Stripe webhook");
    return res
      .status(500)
      .json({ error: { message: "Webhook handler error" } });
  }

  res.json({ received: true });
}
