import type { Request, Response } from "express";

/**
 * Webhook controller — processes incoming webhook events.
 *
 * Currently handles Better-Auth webhook events. Structured to
 * accommodate future webhook sources (e.g. Stripe) by dispatching
 * on event type or source header.
 *
 * The request body arrives as a raw Buffer (not parsed JSON)
 * because this route is mounted with express.raw() BEFORE the
 * global express.json() middleware (§8). This is required for
 * signature verification — the raw, unparsed bytes must match
 * what the sender signed.
 */

/** POST /webhooks — receive webhook events */
export async function handleWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  // req.body is a raw Buffer here (from express.raw)
  const rawBody = req.body as Buffer;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    res.status(400).json({ success: false, message: "Invalid JSON" });
    return;
  }

  // TODO: Verify webhook signature when a signing secret is configured.
  // For Better-Auth webhooks, verify against BETTER_AUTH_SECRET.
  // For Stripe, verify against STRIPE_WEBHOOK_SECRET, etc.

  const eventType = (payload.type as string) ?? "unknown";

  // Dispatch based on event type — extend as new webhook sources
  // and event types are added.
  switch (eventType) {
    // Better-Auth events can be handled here as needed.
    // Example:
    // case "user.created":
    //   await handleUserCreated(payload);
    //   break;

    default:
      // Acknowledge receipt of unhandled event types — returning
      // a non-2xx would cause the sender to retry.
      break;
  }

  res.status(200).json({ received: true });
}
