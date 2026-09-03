"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhotoGrid, type GridPhoto } from "@/components/gallery/PhotoGrid";
import { BulkDownloadButton } from "@/components/gallery/BulkDownloadButton";
import { ConsentModal } from "@/components/gallery/ConsentModal";
import { useEventPhotos } from "@/hooks/useEventPhotos";
import { useDownloadPhoto } from "@/hooks/useDownloadPhoto";
import {
 Camera,
 RefreshCcw,
 Search,
 Upload,
 AlertCircle,
 X,
 Images,
 Loader2,
} from "lucide-react";
import Webcam from "react-webcam";

/**
 * AttendeeFlow — attendee event page (screens #4-#9 per §5).
 *
 * Gallery-first flow (§4): attendees land on the full event gallery,
 * then can optionally search. "Find My Photos" is the secondary action.
 *
 * Consent step (§4): the ConsentModal fires when "Find My Photos" is
 * clicked, NOT as a blanket gate on the page.
 *
 * Composes the shared PhotoGrid, PhotoLightbox, BulkDownloadButton,
 * and ConsentModal components from `components/gallery/` (§9).
 */

interface AttendeeFlowProps {
 eventId: string;
}

interface PublicEvent {
 id: string;
 name: string;
 coverImage: string | null;
}

interface MatchedPhoto {
 id: string;
 previewUrl: string;
}

// ─── Selfie Sheet ─────────────────────────────────────────────────────────────

type SelfieStep = "capture" | "review";

interface SelfieSheetProps {
 onClose: () => void;
 onMatches: (data: { photos: MatchedPhoto[]; downloadToken?: string }) => void;
 eventId: string;
}

function SelfieSheet({ onClose, onMatches, eventId }: SelfieSheetProps) {
 const [step, setStep] = useState<SelfieStep>("capture");
 const [imageSrc, setImageSrc] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const webcamRef = useRef<Webcam>(null);

 const searchMutation = useMutation({
 mutationFn: async (base64Img: string) => {
 const payload = {
 eventId,
 image: base64Img.includes(",") ? base64Img.split(",")[1] : base64Img,
 };
 const response = await fetchApi<{
 matchCount: number;
 photos: MatchedPhoto[];
 downloadToken?: string;
 }>("/search", {
 method: "POST",
 body: JSON.stringify(payload),
 });
 return {
 photos: response.photos ?? [],
 downloadToken: response.downloadToken,
 };
 },
 onSuccess: (data) => {
 onMatches(data);
 onClose();
 },
 onError: (err: Error) => {
 setError(err.message ?? "Search failed. Please try again.");
 },
 });

 const capture = useCallback(() => {
 const image = webcamRef.current?.getScreenshot();
 if (image) {
 setImageSrc(image);
 setStep("review");
 }
 }, []);

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onloadend = () => {
 setImageSrc(reader.result as string);
 setStep("review");
 };
 reader.readAsDataURL(file);
 };

 return (
 <div
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
 onClick={onClose}
 >
 <div
 className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-6 space-y-5">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-serif text-zinc-900 ">
 {step === "capture" ? "Find My Photos" : "Looking good?"}
 </h2>
 <button
 onClick={onClose}
 className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
 >
 <X className="h-5 w-5 text-zinc-500" />
 </button>
 </div>

 <p className="text-sm text-zinc-500">
 {step === "capture"
 ? "Take or upload a selfie — our AI will find your photos in this event."
 : "Confirm your selfie and we'll start scanning the event photos."}
 </p>

 {error && (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
 <AlertCircle className="h-4 w-4 shrink-0" />
 {error}
 </div>
 )}

 <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-100 shadow-inner">
 {step === "capture" ? (
 <>
 <Webcam
 audio={false}
 ref={webcamRef}
 screenshotFormat="image/jpeg"
 videoConstraints={{ facingMode: "user" }}
 className="w-full h-full object-cover"
 />
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="w-32 h-44 border-2 border-white/50 rounded-[2.5rem] border-dashed" />
 </div>
 </>
 ) : imageSrc ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={imageSrc}
 alt="Your selfie"
 className="w-full h-full object-cover"
 />
 ) : null}
 </div>

 {step === "capture" ? (
 <div className="flex gap-3">
 <Button onClick={capture} className="flex-1 h-12 shadow-md">
 <Camera className="mr-2 h-4 w-4" /> Capture
 </Button>
 <Label
 htmlFor="selfie-upload"
 className="flex-1 cursor-pointer h-12 rounded-xl border border-zinc-200 flex items-center justify-center text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm bg-transparent"
 >
 <Upload className="mr-2 h-4 w-4" /> Upload
 </Label>
 <input
 id="selfie-upload"
 type="file"
 accept="image/*"
 className="hidden"
 onChange={handleFileUpload}
 />
 </div>
 ) : (
 <div className="flex gap-3">
 <Button
 variant="outline"
 onClick={() => {
 setImageSrc(null);
 setStep("capture");
 setError(null);
 }}
 className="flex-1 h-12 shadow-sm"
 >
 <RefreshCcw className="mr-2 h-4 w-4" /> Retake
 </Button>
 <Button
 onClick={() => imageSrc && searchMutation.mutate(imageSrc)}
 disabled={searchMutation.isPending}
 className="flex-1 h-12 shadow-md bg-zinc-900 hover:bg-zinc-800 text-white"
 >
 {searchMutation.isPending ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
 </>
 ) : (
 <>
 <Search className="mr-2 h-4 w-4" /> Find My Photos
 </>
 )}
 </Button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AttendeeFlow({ eventId }: AttendeeFlowProps) {
 const [event, setEvent] = useState<PublicEvent | null>(null);
 const [eventError, setEventError] = useState(false);
 const [eventLoaded, setEventLoaded] = useState(false);
 const [showConsentModal, setShowConsentModal] = useState(false);
 const [showSelfieSheet, setShowSelfieSheet] = useState(false);
 const [matchedPhotos, setMatchedPhotos] = useState<MatchedPhoto[] | null>(
 null
 );
 const [downloadToken, setDownloadToken] = useState<string | null>(null);

 // Use the shared hook for cursor-paginated gallery
 const {
 photos: galleryPhotos,
 isLoading: galleryLoading,
 hasNextPage,
 isFetchingNextPage,
 fetchNextPage,
 } = useEventPhotos(eventId);

 const downloadPhoto = useDownloadPhoto();

 // Fetch event info on mount
 useState(() => {
 fetchApi<PublicEvent>(`/events/${eventId}/public`)
 .then((data) => {
 setEvent(data);
 setEventLoaded(true);
 })
 .catch(() => {
 setEventError(true);
 setEventLoaded(true);
 });
 });

 // Handle "Find My Photos" click — shows consent first (§4)
 const handleFindMyPhotos = () => {
 setShowConsentModal(true);
 };

 const handleConsentAccept = () => {
 setShowConsentModal(false);
 setShowSelfieSheet(true);
 };

 const handleDownload = (photo: GridPhoto) => {
 downloadPhoto.mutate({ photoId: photo.id, token: downloadToken ?? undefined });
 };

 // Convert matched photos to GridPhoto shape for the shared PhotoGrid
 const matchedGridPhotos: GridPhoto[] | null = matchedPhotos
 ? matchedPhotos.map((m) => ({
 id: m.id,
 previewUrl: m.previewUrl,
 }))
 : null;

 if (eventError) {
 return (
 <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 p-4">
 <AlertCircle className="h-12 w-12 text-red-400" />
 <h2 className="text-2xl font-serif text-zinc-900">Event not found</h2>
 <p className="text-zinc-500 text-center max-w-md">
 This event link is invalid or the event has been removed.
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2]">
 {/* ── Hero ── */}
 <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-[1400px] mx-auto">
  <div className="relative h-56 md:h-72 overflow-hidden bg-zinc-900 rounded-[2.5rem] border border-zinc-200/50 shadow-sm flex flex-col items-center justify-center text-center px-4">
  <img
  src={event?.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600"}
  alt={event?.name ?? "Event"}
  className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
  <div className="relative z-10 flex flex-col items-center drop-shadow-lg">
  <h1 className="text-4xl md:text-[3rem] lg:text-[3.5rem] font-serif text-white tracking-tight leading-tight max-w-4xl text-balance">
  {event?.name ?? (
  <span className="opacity-0">Loading</span>
  )}
  </h1>
  <p className="text-white/90 mt-4 text-sm md:text-base font-medium tracking-wide">
  {galleryPhotos.length > 0
  ? `${galleryPhotos.length} INDEXED PHOTOS`
  : "EVENT GALLERY"}
  </p>
  </div>
  </div>
 </div>

 {/* ── Action Bar ── */}
  <div className="sticky top-20 z-30 px-4 md:px-8 -mt-6">
  <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md border border-zinc-200/60 shadow-sm rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
  {matchedPhotos !== null ? (
  <>
  <span className="text-sm font-medium text-zinc-700">
  Showing{" "}
  <span className="text-indigo-600 font-semibold">
  {matchedPhotos.length}
  </span>{" "}
  photo{matchedPhotos.length !== 1 ? "s" : ""} matched to you
  </span>
  <button
  onClick={() => setMatchedPhotos(null)}
  className="flex items-center justify-center sm:justify-start gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors underline mt-1 sm:mt-0"
  >
  <Images className="h-3.5 w-3.5" /> View all photos
  </button>
  </>
  ) : (
  <span className="text-sm text-zinc-500">
  {galleryLoading
  ? "Loading photos..."
  : `${galleryPhotos.length} photo${galleryPhotos.length !== 1 ? "s" : ""} in this event`}
  </span>
  )}
  </div>

  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
  {matchedPhotos !== null && matchedPhotos.length > 0 && (
  <BulkDownloadButton
  photoIds={matchedPhotos.map((p) => p.id)}
  token={downloadToken ?? undefined}
  label={`Download All Mine (${matchedPhotos.length})`}
  className="w-full sm:w-auto h-11 sm:h-9"
  />
  )}
  <Button
  className="h-11 px-8 rounded-full gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-transform hover:scale-[1.02] w-full sm:w-auto"
  onClick={handleFindMyPhotos}
  >
  <Search className="h-4 w-4" />
  {matchedPhotos !== null ? "Search Again" : "Find My Photos"}
  </Button>
  </div>
  </div>
 </div>

 {/* ── Gallery ── */}
 <div className="max-w-5xl mx-auto px-4 py-12">
 {matchedPhotos !== null ? (
 /* Matched photos view — screen #8 */
 matchedPhotos.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 text-center">
 <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
 <Search className="h-8 w-8 text-zinc-400" />
 </div>
 <h3 className="text-xl font-serif text-zinc-900">
 No matches found
 </h3>
 <p className="text-zinc-500 mt-2 max-w-sm">
 We couldn&apos;t find any photos of you. The photos may still be
 processing, or try a clearer selfie.
 </p>
 <div className="flex gap-3 mt-6">
 <Button
 variant="outline"
 onClick={() => setMatchedPhotos(null)}
 className="h-11 px-6"
 >
 <Images className="mr-2 h-4 w-4" /> View All Photos
 </Button>
 <Button
 onClick={handleFindMyPhotos}
 className="h-11 px-6"
 >
 <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
 </Button>
 </div>
 </div>
 ) : (
 <PhotoGrid
 photos={matchedGridPhotos!}
 isLoading={false}
 hasNextPage={false}
 isFetchingNextPage={false}
 onLoadMore={() => {}}
 onDownload={handleDownload}
 emptyTitle="No matches found"
 emptyDescription="Try a clearer selfie."
 />
 )
 ) : (
 /* Full event gallery — screen #4 */
 <PhotoGrid
 photos={galleryPhotos}
 isLoading={galleryLoading}
 hasNextPage={hasNextPage}
 isFetchingNextPage={isFetchingNextPage}
 onLoadMore={() => fetchNextPage()}
 onDownload={handleDownload}
 emptyTitle="No photos yet"
 emptyDescription="The photographer hasn't uploaded any photos to this event yet. Check back soon!"
 />
 )}
 </div>

 {/* ── Consent Modal (§4) ── */}
 {showConsentModal && (
 <ConsentModal
 onAccept={handleConsentAccept}
 onClose={() => setShowConsentModal(false)}
 />
 )}

 {/* ── Selfie Sheet (modal) ── */}
 {showSelfieSheet && (
 <SelfieSheet
 eventId={eventId}
 onClose={() => setShowSelfieSheet(false)}
 onMatches={(data) => {
 setMatchedPhotos(data.photos);
 setDownloadToken(data.downloadToken ?? null);
 setShowSelfieSheet(false);
 }}
 />
 )}
 </div>
 );
}
