import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { createEventSchema, eventIdParamSchema } from "./event.schema.js";
import * as eventController from "./event.controller.js";
import * as photoController from "../photos/photo.controller.js";

/**
 * Event routes — all require authentication (§6: auth is the one
 * module nearly everything else legitimately depends on).
 *
 * Exception: GET /:eventId/public is intentionally public (no auth)
 * so unauthenticated attendees can load event info on the landing page.
 *
 * Mounted at /api/events in app.ts.
 */
const router = Router();

/** GET /api/events/:eventId/public — unauthenticated, minimal event info for attendees */
router.get(
  "/:eventId/public",
  validate(eventIdParamSchema, "params"),
  eventController.getPublic,
);

/** GET /api/events/:eventId/photos/public — unauthenticated, paginated INDEXED photos for attendee gallery */
router.get(
  "/:eventId/photos/public",
  validate(eventIdParamSchema, "params"),
  photoController.listPublic,
);

// All remaining event routes require a logged-in user
router.use(requireAuth);

/** POST /api/events — create a new event */
router.post("/", validate(createEventSchema, "body"), eventController.create);

/** GET /api/events — list the logged-in user's events */
router.get("/", eventController.list);

/** GET /api/events/:eventId — get a single event */
router.get(
  "/:eventId",
  validate(eventIdParamSchema, "params"),
  eventController.getById,
);

/** GET /api/events/:eventId/status — get photo processing status */
router.get(
  "/:eventId/status",
  validate(eventIdParamSchema, "params"),
  eventController.getStatus,
);

/** GET /api/events/:eventId/stats — get photographer analytics */
router.get(
  "/:eventId/stats",
  validate(eventIdParamSchema, "params"),
  eventController.getStats,
);

/** DELETE /api/events/:eventId — delete event */
router.delete(
  "/:eventId",
  validate(eventIdParamSchema, "params"),
  eventController.deleteEvent,
);

/** PATCH /api/events/:eventId — update event */
import { updateEventSchema } from "./event.schema.js";
router.patch(
  "/:eventId",
  validate(eventIdParamSchema, "params"),
  validate(updateEventSchema, "body"),
  eventController.update,
);

export default router;
