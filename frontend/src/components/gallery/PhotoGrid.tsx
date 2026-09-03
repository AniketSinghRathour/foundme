"use client";

import { useState, useCallback } from "react";
import { PhotoCard, type PhotoCardPhoto } from "./PhotoCard";
import { PhotoLightbox, type LightboxPhoto } from "./PhotoLightbox";
import { LoadMoreButton } from "./LoadMoreButton";
import { Images, Loader2 } from "lucide-react";

/**
 * PhotoGrid — the ONE shared grid component per §9.
 *
 * Used by three different screens:
 * - Screen #4: Attendee default gallery (all event photos)
 * - Screen #8: Attendee matched-results view (filtered to matches)
 * - Screen #14: Photographer's event photo gallery
 *
 * Built once, generically. Accepts a photo list + pagination state +
 * optional actions, rather than three separate implementations.
 *
 * Pagination contract (§9, matches BACKEND_PLAN §14):
 * - 40 photos per page, cursor-based
 * - Explicit "Load More" button, NOT silent infinite scroll
 * - Staggered entrance animation per §8
 */

export interface GridPhoto extends PhotoCardPhoto {}

interface PhotoGridProps {
 /** The flat list of photos to display (already accumulated from all pages) */
 photos: GridPhoto[];
 /** Whether the initial data is still loading */
 isLoading: boolean;
 /** Whether more pages exist to load */
 hasNextPage: boolean;
 /** Whether the next page is currently being fetched */
 isFetchingNextPage: boolean;
 /** Callback to load the next page */
 onLoadMore: () => void;
 /** Called when a photo's download button is clicked */
 onDownload?: (photo: GridPhoto) => void;
 /** Optional render prop for per-card overlays (status badges, checkboxes) */
 renderCardOverlay?: (photo: GridPhoto) => React.ReactNode;
 /** Optional extra controls rendered in lightbox top bar */
 renderLightboxExtras?: (photo: LightboxPhoto) => React.ReactNode;
 /** Custom empty state message */
 emptyTitle?: string;
 emptyDescription?: string;
 /** Number of skeleton items to show while loading */
 skeletonCount?: number;
}

export function PhotoGrid({
 photos,
 isLoading,
 hasNextPage,
 isFetchingNextPage,
 onLoadMore,
 onDownload,
 renderCardOverlay,
 renderLightboxExtras,
 emptyTitle = "No photos yet",
 emptyDescription = "Check back soon!",
 skeletonCount = 24,
}: PhotoGridProps) {
 const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

 const openLightbox = useCallback(
 (photo: GridPhoto) => {
 const idx = photos.findIndex((p) => p.id === photo.id);
 setLightboxIndex(idx >= 0 ? idx : 0);
 },
 [photos]
 );

 const handleLightboxDownload = useCallback(
 (photo: LightboxPhoto) => {
 if (onDownload) {
 const gridPhoto = photos.find((p) => p.id === photo.id);
 if (gridPhoto) onDownload(gridPhoto);
 }
 },
 [onDownload, photos]
 );

 // Loading skeleton
 if (isLoading) {
 return (
 <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
 {Array.from({ length: skeletonCount }).map((_, i) => (
 <div
 key={i}
 className="break-inside-avoid aspect-square rounded-2xl bg-zinc-200 animate-pulse"
 style={{
 // Vary skeleton heights for masonry effect
 aspectRatio:
 i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/3" : "1/1",
 }}
 />
 ))}
 </div>
 );
 }

 // Empty state
 if (photos.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-24 text-center">
 <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
 <Images className="h-8 w-8 text-zinc-400" />
 </div>
 <h3 className="text-xl font-serif text-zinc-900 ">
 {emptyTitle}
 </h3>
 <p className="text-zinc-500 mt-2 max-w-sm">{emptyDescription}</p>
 </div>
 );
 }

 return (
 <>
 {/* Masonry grid */}
 <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
 {photos.map((photo, i) => (
 <PhotoCard
 key={photo.id}
 photo={photo}
 index={i}
 onClick={() => openLightbox(photo)}
 onDownload={onDownload ? () => onDownload(photo) : undefined}
 renderOverlay={
 renderCardOverlay
 ? () => renderCardOverlay(photo)
 : undefined
 }
 />
 ))}
 </div>

 {/* Load More button — explicit, not silent infinite scroll (§9) */}
 <LoadMoreButton
 onClick={onLoadMore}
 isLoading={isFetchingNextPage}
 hasMore={hasNextPage}
 />

 {/* Lightbox */}
 {lightboxIndex !== null && (
 <PhotoLightbox
 photos={photos}
 startIndex={lightboxIndex}
 onClose={() => setLightboxIndex(null)}
 onDownload={onDownload ? handleLightboxDownload : undefined}
 renderTopBarExtras={renderLightboxExtras}
 />
 )}
 </>
 );
}
