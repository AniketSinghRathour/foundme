import { Router } from "express";
import * as webhookController from "./webhook.controller.js";

/**
 * Webhook routes — receives external webhook events.
 *
 * IMPORTANT: This router is mounted in app.ts with express.raw()
 * BEFORE the global express.json() middleware (§8). The raw body
 * is needed for signature verification. Do NOT apply express.json()
 * or any other body parser to these routes.
 *
 * Mounted at /webhooks (not /api/webhooks) in app.ts.
 */
const router = Router();

/** POST /webhooks — receive webhook events */
router.post("/", webhookController.handleWebhook);

export default router;
