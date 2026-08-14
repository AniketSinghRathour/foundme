import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { optionalAuth } from "../auth/auth.middleware.js";
import { searchSchema } from "./search.schema.js";
import * as searchController from "./search.controller.js";

/**
 * Search routes — attendee-facing, no authentication required.
 *
 * Mounted at /api/search in app.ts.
 *
 * Rate-limiting will be added via search.middleware.ts when
 * that deferred item (§9) is implemented.
 */
const router = Router();

/** POST /api/search — selfie search against an event's face collection */
router.post("/", optionalAuth, validate(searchSchema, "body"), searchController.search);

export default router;
