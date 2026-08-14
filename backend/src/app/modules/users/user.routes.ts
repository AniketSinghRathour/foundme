import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import * as userController from "./user.controller.js";

/**
 * User routes — all require authentication (§6).
 *
 * Mounted at /api/users in app.ts.
 * Per §7: "Events I created" and "Events I've searched" are tracked
 * separately, even for the same account — served by two distinct endpoints.
 */
const router = Router();

router.use(requireAuth);

/** GET /api/users/me — current user's profile */
router.get("/me", userController.getMyProfile);

/** GET /api/users/me/created-events — events this user created (photographer view, §7) */
router.get("/me/created-events", userController.getMyCreatedEvents);



export default router;
