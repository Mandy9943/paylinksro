import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";
import { onAccountUpdated } from "./handlers/account.js";
import {
  onChargeDisputeCreated,
  onChargeRefunded,
  onChargeSucceeded,
} from "./handlers/charge.js";
import {
  onPaymentIntentAmountCapturableUpdated,
  onPaymentIntentFailed,
  onPaymentIntentRequiresAction,
  onPaymentIntentSucceeded,
} from "./handlers/payment_intent.js";

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
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET_CONNECTED
      );
    } catch (error) {
      logger.warn({ err }, "Invalid Stripe signature");
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    // Idempotency: store Stripe event id; if exists, short-circuit
    try {
      await prisma.webhookEvent.create({
        data: {
          provider: "STRIPE",
          eventId: event.id as string,
          type: event.type as string,
        },
      });
    } catch (e: any) {
      // Unique constraint -> already processed
      return res.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
        await onPaymentIntentAmountCapturableUpdated(event);
        break;
      case "payment_intent.requires_action":
        await onPaymentIntentRequiresAction(event);
        break;
      case "payment_intent.succeeded":
        await onPaymentIntentSucceeded(event);
        break;
      case "payment_intent.payment_failed":
        await onPaymentIntentFailed(event);
        break;
      case "account.updated":
        await onAccountUpdated(event);
        break;
      case "charge.succeeded":
        await onChargeSucceeded(event);
        break;
      case "charge.refunded":
        await onChargeRefunded(event);
        break;
      case "charge.dispute.created":
        await onChargeDisputeCreated(event);
        break;
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
