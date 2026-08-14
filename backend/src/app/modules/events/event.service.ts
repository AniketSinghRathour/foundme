import { CreateCollectionCommand, DeleteCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognition } from "../../common/config/rekognition.js";
import { prisma } from "../../common/config/prisma.js";
import { ApiError } from "../../common/utils/ApiError.js";

/**
 * Events service — calls Prisma directly (no repository layer, §7).
 *
 * Creating an event also triggers Rekognition CreateCollection (§7):
 * each event maps 1:1 to a Rekognition collection for face indexing.
 */

/**
 * Generates a URL-friendly slug from an event name.
 * Appends a short random suffix to avoid collisions.
 */


/** Create a new event + its Rekognition collection */
export async function createEvent(
  ownerId: string,
  data: { name: string; description?: string; coverImage?: string },
) {
  // 1. Create the DB record first to get the auto-generated CUID
  const event = await prisma.event.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      coverImage: data.coverImage ?? null,
      rekognitionCollectionId: "pending", // placeholder
      ownerId,
    },
  });

  const rekognitionCollectionId = event.id;

  // 2. Create the Rekognition collection using the exact CUID
  await rekognition.send(
    new CreateCollectionCommand({
      CollectionId: rekognitionCollectionId,
    }),
  );

  // 3. Update the event with the correct collection ID
  return prisma.event.update({
    where: { id: event.id },
    data: { rekognitionCollectionId },
  });
}

/** List all events owned by a specific user */
export async function listEventsByOwner(ownerId: string) {
  return prisma.event.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

/** Get a single event by ID (verifying ownership) */
export async function getEventById(eventId: string, ownerId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw ApiError.notFound("Event not found");
  }

  if (event.ownerId !== ownerId) {
    throw ApiError.forbidden("You do not own this event");
  }

  return event;
}

/**
 * Get event status — returns photo counts by status for the
 * frontend's upload-progress polling UI (§7).
 */
export async function getEventStatus(eventId: string, ownerId: string) {
  const event = await getEventById(eventId, ownerId);

  const [total, indexed, failed] = await Promise.all([
    prisma.photo.count({ where: { eventId } }),
    prisma.photo.count({ where: { eventId, status: "INDEXED" } }),
    prisma.photo.count({ where: { eventId, status: "FAILED" } }),
  ]);

  return {
    eventId: event.id,
    eventName: event.name,
    total,
    indexed,
    pending: total - indexed - failed,
    failed,
  };
}

/** Update event details */
export async function updateEvent(
  eventId: string,
  ownerId: string,
  data: { name?: string; description?: string; coverImage?: string }
) {
  const event = await getEventById(eventId, ownerId);

  return prisma.event.update({
    where: { id: event.id },
    data,
  });
}

/**
 * Deep delete an event and all its associated data:
 * - Deletes all photos from S3, R2, and Rekognition faces (via photoService)
 * - Deletes the Rekognition collection
 * - Deletes the Event from DB (cascades to DB photos/faces)
 */
export async function deleteEvent(eventId: string, ownerId: string) {
  const event = await getEventById(eventId, ownerId);

  // 1. Delete all photos from S3/R2 (and Rekognition faces, though the collection delete handles faces too, but this cleans up S3/R2)
  const photos = await prisma.photo.findMany({
    where: { eventId },
    select: { id: true },
  });

  if (photos.length > 0) {
    // Dynamically import to avoid circular dependency
    const { deletePhotos } = await import("../photos/photo.service.js");
    const photoIds = photos.map(p => p.id);
    
    // We chunk the deletes if it's huge, but deletePhotos handles arrays.
    // For production with >1000 photos, we'd need pagination inside deletePhotos.
    await deletePhotos(photoIds, ownerId);
  }

  // 2. Delete the Rekognition Collection
  await rekognition.send(
    new DeleteCollectionCommand({
      CollectionId: event.rekognitionCollectionId,
    })
  ).catch(err => {
    if (err.name === "ResourceNotFoundException") {
      console.log(`[Info] Rekognition collection ${event.rekognitionCollectionId} already deleted or not found.`);
    } else {
      console.error("Rekognition collection delete error", err);
    }
  });

  // 3. Delete from DB
  await prisma.event.delete({
    where: { id: event.id },
  });
}

/**
 * Get minimal public event info — no ownership check, no auth required.
 * Returns only the fields the attendee landing page needs (id, name, coverImage).
 * Used by GET /api/events/:eventId/public
 */
export async function getPublicEventInfo(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      coverImage: true,
    },
  });

  if (!event) {
    throw ApiError.notFound("Event not found or you don't have access.");
  }
  return event;
}

/**
 * Get aggregated search analytics for an event.
 */
export async function getEventStats(eventId: string, ownerId: string) {
  // Ensure the user owns this event
  await getEventById(eventId, ownerId);

  const stats = await prisma.eventSearch.aggregate({
    where: { eventId },
    _count: { id: true },
    _sum: { matchesFound: true },
  });

  return {
    totalSearches: stats._count.id,
    totalPhotosFound: stats._sum.matchesFound ?? 0,
  };
}
