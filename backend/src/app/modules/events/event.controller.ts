import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import * as eventService from "./event.service.js";
import type { CreateEventInput, EventIdParam, UpdateEventInput } from "./event.schema.js";
/**
 * Events controller — shapes responses inline as plain object
 * literals (no DTO file, §7). Throws ApiError directly for error
 * cases; Express 5 forwards to errorHandler automatically (§5).
 */

/** POST /api/events */
export async function create(
  req: Request<{}, {}, CreateEventInput>,
  res: Response,
): Promise<void> {
  const { name, description, coverImage } = req.body;
  const ownerId = req.user!.id;

  const event = await eventService.createEvent(ownerId, {
    name,
    description,
    coverImage,
  });

  ApiResponse.created(res, "Event created", {
    id: event.id,
    name: event.name,
    description: event.description,
    coverImage: event.coverImage,
    rekognitionCollectionId: event.rekognitionCollectionId,
    createdAt: event.createdAt,
  });
}

/** GET /api/events */
export async function list(req: Request, res: Response): Promise<void> {
  const ownerId = req.user!.id;

  const events = await eventService.listEventsByOwner(ownerId);

  ApiResponse.ok(
    res,
    "Events retrieved",
    events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      coverImage: e.coverImage,
      createdAt: e.createdAt,
    })),
  );
}

/** GET /api/events/:eventId */
export async function getById(
  req: Request<EventIdParam>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { eventId } = req.params;

  const event = await eventService.getEventById(eventId, ownerId);

  ApiResponse.ok(res, "Event retrieved", {
    id: event.id,
    name: event.name,
    description: event.description,
    coverImage: event.coverImage,
    rekognitionCollectionId: event.rekognitionCollectionId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  });
}

/** GET /api/events/:eventId/status */
export async function getStatus(
  req: Request<EventIdParam>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { eventId } = req.params;

  const status = await eventService.getEventStatus(eventId, ownerId);

  ApiResponse.ok(res, "Event status retrieved", status);
}

/** DELETE /api/events/:eventId */
export async function deleteEvent(
  req: Request<EventIdParam>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { eventId } = req.params;

  await eventService.deleteEvent(eventId, ownerId);

  ApiResponse.ok(res, "Event deleted successfully");
}

/** PATCH /api/events/:eventId */
export async function update(
  req: Request<EventIdParam, {}, UpdateEventInput>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { eventId } = req.params;
  const { name, description, coverImage } = req.body;

  const event = await eventService.updateEvent(eventId, ownerId, {
    name,
    description,
    coverImage,
  });

  ApiResponse.ok(res, "Event updated", {
    id: event.id,
    name: event.name,
    description: event.description,
    coverImage: event.coverImage,
    updatedAt: event.updatedAt,
  });
}

/** GET /api/events/:eventId/public — public, no auth required */
export async function getPublic(
  req: Request<EventIdParam>,
  res: Response,
): Promise<void> {
  const { eventId } = req.params;

  const event = await eventService.getPublicEventInfo(eventId);

  ApiResponse.ok(res, "Event retrieved", {
    id: event.id,
    name: event.name,
    coverImage: event.coverImage,
  });
}

/** GET /api/events/:eventId/stats */
export async function getStats(
  req: Request<EventIdParam>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { eventId } = req.params;

  const stats = await eventService.getEventStats(eventId, ownerId);
  ApiResponse.ok(res, "Event stats retrieved", stats);
}
