import sharp from "sharp";
import { config } from "../config.js";

// Small, fast-loading version for the attendee-facing gallery/search results.
// WebP, not JPEG - this image is browser-only (never sent to Rekognition,
// which only accepts JPEG/PNG), so WebP's smaller file size is a clean win.
export async function generatePreview(originalBuffer) {
  return sharp(originalBuffer)
    .resize({ width: config.image.previewWidth, withoutEnlargement: true })
    .webp({ quality: config.image.previewQuality })
    .toBuffer();
}

// Larger working copy fed to Rekognition. Big enough that faces in group
// shots stay reliably detectable, small enough to clear the 5MB Bytes
// limit with room to spare. Never persisted - in-memory only.
export async function generateIndexingCopy(originalBuffer) {
  return sharp(originalBuffer)
    .resize({ width: config.image.indexingCopyWidth, withoutEnlargement: true })
    .jpeg({ quality: config.image.indexingCopyQuality })
    .toBuffer();
}
