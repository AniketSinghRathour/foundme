/**
 * QR code generation helper per §7.
 *
 * The actual QR rendering is handled by the `qrcode.react` library
 * (already installed). This module provides utility functions for
 * generating the shareable event URL used as QR data.
 */

/**
 * Generate the public attendee URL for an event.
 * Used as the QR code data and share link.
 */
export function getEventShareUrl(eventId: string): string {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://foundme.example.com";
  return `${baseUrl}/e/${eventId}`;
}
