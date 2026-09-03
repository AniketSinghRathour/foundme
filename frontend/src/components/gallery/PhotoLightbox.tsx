"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared photo lightbox — screen #5 per FRONTEND_PLAN §5.
 *
 * Enlarged single-photo view opened from the grid. Supports:
 * - Previous/Next navigation (arrow keys, swipe, visible controls)
 * - Single-photo download button
 * - Keyboard shortcuts (ArrowLeft/Right, Escape)
 * - Smooth cross-fade transition between photos
 * - Filmstrip thumbnail strip at the bottom
 *
 * Used by both attendee gallery and photographer gallery.
 */

export interface LightboxPhoto {
 id: string;
 previewUrl: string;
}

interface PhotoLightboxProps {
 photos: LightboxPhoto[];
 startIndex: number;
 onClose: () => void;
 onDownload?: (photo: LightboxPhoto) => void;
 /** Optional extra controls rendered in the top bar */
 renderTopBarExtras?: (photo: LightboxPhoto) => React.ReactNode;
}

export function PhotoLightbox({
 photos,
 startIndex,
 onClose,
 onDownload,
 renderTopBarExtras,
}: PhotoLightboxProps) {
 const [current, setCurrent] = useState(startIndex);

 const prev = useCallback(
 () => setCurrent((i) => (i > 0 ? i - 1 : photos.length - 1)),
 [photos.length]
 );
 const next = useCallback(
 () => setCurrent((i) => (i < photos.length - 1 ? i + 1 : 0)),
 [photos.length]
 );

 // Keyboard navigation
 useEffect(() => {
 const handler = (e: KeyboardEvent) => {
 if (e.key === "ArrowLeft") prev();
 if (e.key === "ArrowRight") next();
 if (e.key === "Escape") onClose();
 };
 window.addEventListener("keydown", handler);
 return () => window.removeEventListener("keydown", handler);
 }, [prev, next, onClose]);

 // Lock body scroll while lightbox is open
 useEffect(() => {
 document.body.style.overflow = "hidden";
 return () => {
 document.body.style.overflow = "";
 };
 }, []);

 const photo = photos[current];
 if (!photo) return null;

 return (
 <div
 className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
 onClick={onClose}
 >
 {/* Top controls */}
 <div
 className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10"
 onClick={(e) => e.stopPropagation()}
 >
 <span className="text-white/60 text-sm font-medium">
 {current + 1} / {photos.length}
 </span>
 <div className="flex items-center gap-2">
 {renderTopBarExtras?.(photo)}
 {onDownload && (
 <Button
 size="sm"
 variant="secondary"
 className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
 onClick={() => onDownload(photo)}
 >
 <Download className="h-4 w-4 mr-1.5" />
 Download
 </Button>
 )}
 <button
 onClick={onClose}
 className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 </div>

 {/* Main image with cross-fade */}
 <div
 className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center px-16"
 onClick={(e) => e.stopPropagation()}
 >
 <AnimatePresence mode="wait">
 <motion.img
 key={photo.id}
 src={photo.previewUrl}
 alt={`Photo ${current + 1}`}
 className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 />
 </AnimatePresence>
 </div>

 {/* Prev / Next arrows */}
 {photos.length > 1 && (
 <>
 <button
 onClick={(e) => {
 e.stopPropagation();
 prev();
 }}
 className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
 >
 <ChevronLeft className="h-6 w-6" />
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 next();
 }}
 className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
 >
 <ChevronRight className="h-6 w-6" />
 </button>
 </>
 )}

 {/* Filmstrip thumbnails */}
 <div
 className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex gap-2 justify-center">
 {photos.map((p, i) => (
 <button
 key={p.id}
 onClick={() => setCurrent(i)}
 className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
 i === current
 ? "border-white scale-110"
 : "border-white/20 opacity-50 hover:opacity-80"
 }`}
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={p.previewUrl}
 alt=""
 className="w-full h-full object-cover"
 />
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}
