import Stripe from "stripe";
import { env } from "../config/env.js";

let stripeInstance: Stripe | null = null;

/**
 * Returns a memoized Stripe client using the latest API version.
 * Throws a helpful error if STRIPE_SECRET_KEY is not configured.
 */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Set it in your environment (.env) to enable Stripe."
    );
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      // Requested by user: use the latest version
      apiVersion: "2025-07-30.basil",
    });
  }
  return stripeInstance;
}

/** Returns the publishable key for clients; throws a helpful error if missing. */
export function getPublishableKey(): string {
  if (!env.STRIPE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing STRIPE_PUBLISHABLE_KEY. Set it in your environment (.env) to enable Stripe client."
    );
  }
  return env.STRIPE_PUBLISHABLE_KEY;
}
