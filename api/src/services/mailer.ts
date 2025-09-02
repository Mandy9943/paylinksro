import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

let resend: Resend | undefined;
if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = env.MAIL_FROM || "PayLinks <salut@paylinks.ro>";

  // Suppress real emails during tests
  if (env.NODE_ENV === "test") {
    logger.info({ to, subject }, "Email suppressed (test mode)");
    return { mocked: true, suppressed: true } as any;
  }

  if (!resend) {
    // Dev fallback: log email contents
    logger.info(
      { from, to, subject, html },
      "Email (log only, RESEND_API_KEY not set)"
    );
    return { mocked: true } as any;
  }

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    logger.error({ error }, "Resend email error");
    throw Object.assign(new Error("Email send failed"), { cause: error });
  }

  logger.info({ id: (data as any)?.id, to }, "Email sent via Resend");
  return data;
}
