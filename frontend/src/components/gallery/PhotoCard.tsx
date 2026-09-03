"use client";

import { Download, ZoomIn } from "lucide-react";
import { motion } from "framer-motion";

/**
 * PhotoCard — individual photo tile used inside PhotoGrid (§9).
 *
 * Hover micro-interactions per §8:
 * - Subtle scale (1.02–1.03x max)
 * - Slight shadow lift
 * - Gradient overlay with download + zoom icons
 *
 * Accepts a generic photo shape (id + previewUrl) and optional
 * status badge / selection controls via render props.
 */

export interface PhotoCardPhoto {
 id: string;
 previewUrl: string;
}

interface PhotoCardProps {
 photo: PhotoCardPhoto;
 index: number;
 onClick?: () => void;
 onDownload?: (photo: PhotoCardPhoto) => void;
 /** Optional render prop for extra overlays (status badges, selection checkboxes) */
 renderOverlay?: (photo: PhotoCardPhoto) => React.ReactNode;
}

export function PhotoCard({
 photo,
 index,
 onClick,
 onDownload,
 renderOverlay,
}: PhotoCardProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.6) }}
 className="break-inside-avoid relative group overflow-hidden rounded-2xl bg-zinc-100 cursor-pointer shadow-sm ring-1 ring-zinc-900/5 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
 onClick={onClick}
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={photo.previewUrl}
 alt={`Photo ${index + 1}`}
 className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
 loading="lazy"
 />

 {/* Hover gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

 {/* Zoom icon - top left */}
 <div className="absolute top-2 left-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
 <ZoomIn className="h-3.5 w-3.5 text-white" />
 </div>

 {/* Download button - bottom right */}
 {onDownload && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 onDownload(photo);
 }}
 className="absolute bottom-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border border-white/30 transition-colors opacity-0 group-hover:opacity-100 z-10"
 >
 <Download className="h-4 w-4" />
 </button>
 )}

 {/* Custom overlays (status badges, selection checkboxes, etc.) */}
 {renderOverlay?.(photo)}
 </motion.div>
 );
}
