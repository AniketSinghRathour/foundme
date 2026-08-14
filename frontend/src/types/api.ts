export type Event = {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  rekognitionCollectionId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Minimal public event info — returned by GET /api/events/:id/public (no auth required) */
export type PublicEvent = {
  id: string;
  name: string;
  coverImage: string | null;
};

/** Event with photo count — returned by GET /api/users/me/created-events */
export type CreatedEvent = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  createdAt: Date;
  photoCount: number;
};

export type PhotoStatus = "PENDING" | "INDEXED" | "FAILED";

export type Photo = {
  id: string;
  eventId: string;
  s3KeyOriginal: string;
  r2KeyPreview?: string;
  previewUrl?: string;
  status: PhotoStatus;
  errorMessage?: string;
  uploadedAt?: Date;
  indexedAt?: Date;
};

export type Face = {
  id: string;
  photoId: string;
  rekognitionFaceId: string;
  boundingBox?: unknown;
  confidence?: number;
  createdAt: Date;
};

export type EventSearch = {
  id: string;
  userId: string;
  eventId: string;
  searchedAt: Date;
  event?: {
    id: string;
    name: string;
    coverImage: string | null;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};
