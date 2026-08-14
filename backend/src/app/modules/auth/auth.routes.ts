import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.config.js";

/**
 * Auth routes — delegates entirely to Better-Auth's built-in handler.
 *
 * Better-Auth manages its own sub-routes (sign-in, sign-up, callback,
 * session, etc.) internally. We just mount its Node handler here.
 *
 * Express 5 requires `/*splat` for catch-all routes (not `/*`).
 *
 * IMPORTANT: This router must be mounted in app.ts BEFORE the global
 * express.json() middleware — Better-Auth parses its own request bodies
 * and conflicts with pre-parsed bodies (§8).
 */
const router = Router();

router.all("/*splat", toNodeHandler(auth));

export default router;
