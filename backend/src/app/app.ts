import express from "express";
import type { Express } from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";
import eventRouter from "./modules/events/event.routes.js";
import photoRouter from "./modules/photos/photo.routes.js";
import searchRouter from "./modules/search/search.routes.js";
import webhookRouter from "./modules/webhooks/webhook.routes.js";
import userRouter from "./modules/users/user.routes.js";
import { errorHandler } from "./common/middleware/errorHandler.js";

/**
 * Creates and configures the Express application (§8).
 *
 * Mounting order matters:
 * 1. CORS — wide open for now (§9: lockdown is deliberately deferred)
 * 2. Auth routes — BEFORE express.json(), Better-Auth parses its own body
 * 3. Webhook routes — BEFORE express.json(), needs raw body (§8)
 * 4. express.json() — global for all other routes
 * 5. Domain module routers
 * 6. errorHandler — LAST, after all routes
 */
export function createApplication(): Express {
  const app = express();

  // ── 1. CORS — explicitly allow frontend origin and credentials ──
  app.use(cors({
    origin: true, // Dynamically allows the requested origin (effectively all origins) while permitting credentials
    credentials: true,
  }));

  // ── 2. Auth routes — mounted BEFORE json parser ──
  // Better-Auth manages its own body parsing; pre-parsed bodies
  // cause 404s or hung requests.
  app.use("/api/auth", authRouter);

  // ── 3. Webhook routes — BEFORE json parser, with raw body (§8) ──
  app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter);

  // ── 4. Global JSON body parser for all remaining routes ──
  app.use(express.json({ limit: "50mb" }));

  // ── 5. Health check & Welcome route ──
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to GP2 Backend Service" });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ── 6. Domain module routers ──
  app.use("/api/events", eventRouter);
  app.use("/api/photos", photoRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/users", userRouter);

  // ── 7. Error handler — MUST be last (§5, §8) ──
  app.use(errorHandler);

  return app;
}
