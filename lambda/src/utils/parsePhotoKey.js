// Expected key shape: originals/{eventId}/{photoId}.jpg

const KEY_PATTERN = /^originals\/([^/]+)\/([^/.]+)\.[a-zA-Z0-9]+$/;

export class InvalidPhotoKeyError extends Error {
  constructor(key) {
    super(`S3 key does not match expected pattern "originals/{eventId}/{photoId}.ext": ${key}`);
    this.name = "InvalidPhotoKeyError";
  }
}

export function parsePhotoKey(key) {
  const match = key.match(KEY_PATTERN);
  if (!match) {
    throw new InvalidPhotoKeyError(key);
  }
  const [, eventId, photoId] = match;
  return { eventId, photoId };
}
