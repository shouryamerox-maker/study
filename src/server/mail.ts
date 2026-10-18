import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends email when SMTP is configured (e.g. Brevo / Gmail app password / Resend SMTP).
 * Returns false when email is not configured so callers can fall back honestly
 * (e.g. showing the teacher a link to share manually).
 */
export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") console.info(`[mail:dev] to=${to} subject="${subject}"\n${text}`);
    return false;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to, subject, text });
  return true;
}

export function appUrl(path = "") {
  return `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}${path}`;
}
