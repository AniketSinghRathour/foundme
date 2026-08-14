import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import * as searchService from "./search.service.js";
import type { SearchInput } from "./search.schema.js";
/**
 * Search controller — attendee-facing selfie search.
 */

/** POST /api/search — selfie search */
export async function search(
  req: Request<{}, {}, SearchInput>,
  res: Response,
): Promise<void> {
  const { eventId, image } = req.body;
  const userId = req.user?.id;

  const photos = await searchService.searchByFace(eventId, image, userId);

  ApiResponse.ok(res, "Search completed", {
    matchCount: photos.length,
    photos: photos.map((p) => ({
      id: p.id,
      previewUrl: p.previewUrl,
    })),
  });
}
