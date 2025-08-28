import { prisma } from "../../../lib/prisma.js";
import {
  findPayLinkBasic,
  incrementFundraisingIfNeeded,
  upsertTransactionFromPI,
} from "./utils.js";

export async function onPaymentIntentAmountCapturableUpdated(event: any) {
  const pi = event.data.object as any;
  const paylinkId = pi?.metadata?.paylinkId as string | undefined;
  if (!paylinkId) return;
  const link = await prisma.payLink.findUnique({
    where: { id: paylinkId },
    select: { id: true, userId: true, currency: true },
  });
  if (!link) return;
  await upsertTransactionFromPI(link, pi, "UNCAPTURED");
}

export async function onPaymentIntentRequiresAction(event: any) {
  const pi = event.data.object as any;
  const paylinkId = pi?.metadata?.paylinkId as string | undefined;
  if (!paylinkId) return;
  const link = await prisma.payLink.findUnique({
    where: { id: paylinkId },
    select: { id: true, userId: true, currency: true },
  });
  if (!link) return;
  await upsertTransactionFromPI(link, pi, "REQUIRES_ACTION");
}

export async function onPaymentIntentSucceeded(event: any) {
  const pi = event.data.object as any;
  const paylinkId = pi?.metadata?.paylinkId as string | undefined;
  const amountMinor = (pi?.amount as number) ?? 0;
  if (!paylinkId) return;
  const link = await findPayLinkBasic(paylinkId);
  if (!link) return;
  await incrementFundraisingIfNeeded(link, amountMinor);
}

export async function onPaymentIntentFailed(event: any) {
  const pi = event.data.object as any;
  const paylinkId = pi?.metadata?.paylinkId as string | undefined;
  if (!paylinkId) return;
  const link = await prisma.payLink.findUnique({
    where: { id: paylinkId },
    select: { id: true, userId: true, currency: true },
  });
  if (!link) return;
  const failure = pi?.last_payment_error;
  const amountMinor = (pi?.amount as number) ?? 0;
  await prisma.transaction.upsert({
    where: { stripePaymentIntentId: pi.id as string },
    update: {
      status: "FAILED",
      failureCode: failure?.code || null,
      failureMessage: failure?.message || null,
    },
    create: {
      userId: link.userId,
      payLinkId: link.id,
      amount: amountMinor,
      currency: (link.currency || "RON").toUpperCase(),
      status: "FAILED",
      stripePaymentIntentId: pi.id as string,
      description: pi?.description || null,
    },
  });
}
