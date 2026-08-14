import nodemailer from "nodemailer";
import { env } from "./env.js";

/**
 * Nodemailer transport configuration.
 * Instantiates the SMTP connection to Gmail using environment variables.
 */
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Helper function to send an email.
 * This abstracts away the nodemailer transporter implementation.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"GP2 Tester" <${env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
