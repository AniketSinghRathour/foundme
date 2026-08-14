import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { prisma } from "../../common/config/prisma.js";

/** GET /api/users/me — get the current user's profile */
export async function getMyProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user!;

  ApiResponse.ok(res, "Profile retrieved", {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
  });
}

/** GET /api/users/me/created-events — list events created by this user (photographer capability, §7) */
export async function getMyCreatedEvents(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;

  const events = await prisma.event.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      coverImage: true,
      createdAt: true,
      // Count photos in each event for a summary stat
      _count: {
        select: { photos: true },
      },
    },
  });

  ApiResponse.ok(
    res,
    "Created events retrieved",
    events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      coverImage: e.coverImage,
      createdAt: e.createdAt,
      photoCount: e._count.photos,
    })),
  );
}

