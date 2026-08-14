"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Camera,
  RefreshCcw,
  Search,
  Download,
  Upload,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Images,
  Loader2,
  ZoomIn,
  PackageOpen,
  ArrowDownToLine,
} from "lucide-react";
import Webcam from "react-webcam";

interface AttendeeFlowProps {
  eventId: string;
}

interface PublicEvent {
  id: string;
  name: string;
  coverImage: string | null;
}

interface GalleryPhoto {
  id: string;
  previewUrl: string;
  createdAt: Date;
}

interface MatchedPhoto {
  id: string;
  previewUrl: string;
}

interface PublicPhotosPage {
  photos: GalleryPhoto[];
  nextCursor: string | null;
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

interface LightboxProps {
  photos: GalleryPhoto[];
  startIndex: number;
  onClose: () => void;
  onDownload: (photo: GalleryPhoto) => void;
}

function Lightbox({ photos, startIndex, onClose, onDownload }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length]);
  const next = useCallback(() => setCurrent((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length]);

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

  const photo = photos[current];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Controls bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm font-medium">
          {current + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
            onClick={() => onDownload(photo)}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.previewUrl}
          alt={`Photo ${current + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Prev / Next */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Filmstrip */}
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
                i === current ? "border-white scale-110" : "border-white/20 opacity-50 hover:opacity-80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Selfie Sheet ─────────────────────────────────────────────────────────────

type SelfieStep = "capture" | "review";

interface SelfieSheetProps {
  onClose: () => void;
  onMatches: (photos: MatchedPhoto[]) => void;
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
      const response = await fetchApi<{ matchCount: number; photos: MatchedPhoto[] }>("/search", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.photos ?? [];
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
    if (image) { setImageSrc(image); setStep("review"); }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImageSrc(reader.result as string); setStep("review"); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-950 w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-50">
              {step === "capture" ? "Find My Photos" : "Looking good?"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X className="h-5 w-5 text-zinc-500" />
            </button>
          </div>

          <p className="text-sm text-zinc-500">
            {step === "capture"
              ? "Take or upload a selfie — our AI will find your photos in this event."
              : "Confirm your selfie and we'll start scanning the event photos."}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-100 dark:bg-zinc-900 shadow-inner">
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
              <img src={imageSrc} alt="Your selfie" className="w-full h-full object-cover" />
            ) : null}
          </div>

          {step === "capture" ? (
            <div className="flex gap-3">
              <Button onClick={capture} className="flex-1 h-12 shadow-md">
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
              <Label htmlFor="selfie-upload" className="flex-1 cursor-pointer h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm bg-transparent">
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Label>
              <input id="selfie-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setImageSrc(null); setStep("capture"); setError(null); }} className="flex-1 h-12 shadow-sm">
                <RefreshCcw className="mr-2 h-4 w-4" /> Retake
              </Button>
              <Button
                onClick={() => imageSrc && searchMutation.mutate(imageSrc)}
                disabled={searchMutation.isPending}
                className="flex-1 h-12 shadow-md bg-zinc-900 hover:bg-zinc-800 text-white"
              >
                {searchMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" /> Find My Photos</>
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
  const [showSelfieSheet, setShowSelfieSheet] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState<MatchedPhoto[] | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<GalleryPhoto[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch event info
  useEffect(() => {
    fetchApi<PublicEvent>(`/events/${eventId}/public`)
      .then(setEvent)
      .catch(() => setEventError(true));
  }, [eventId]);

  // Infinite paginated gallery
  const {
    data: galleryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: galleryLoading,
  } = useInfiniteQuery({
    queryKey: ["event-gallery-public", eventId],
    queryFn: ({ pageParam }) =>
      fetchApi<PublicPhotosPage>(
        `/events/${eventId}/photos/public${pageParam ? `?cursor=${pageParam}` : ""}`
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const allGalleryPhotos = galleryData?.pages.flatMap((p) => p.photos) ?? [];

  // Build match-enriched gallery for lightbox
  const lightboxSource: GalleryPhoto[] = matchedPhotos
    ? matchedPhotos.map((m) => ({ id: m.id, previewUrl: m.previewUrl, createdAt: new Date() }))
    : allGalleryPhotos;

  const openLightbox = (photo: GalleryPhoto, sourceList: GalleryPhoto[]) => {
    const idx = sourceList.findIndex((p) => p.id === photo.id);
    setLightboxPhotos(sourceList);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const handleDownload = async (photo: GalleryPhoto) => {
    try {
      const res = await fetchApi<{ downloadUrl: string; fileName: string }>(`/photos/${photo.id}/download`);
      const a = document.createElement("a");
      a.href = res.downloadUrl;
      a.download = res.fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDownloadAll = async (photos: GalleryPhoto[]) => {
    try {
      const results = await fetchApi<{ id: string; downloadUrl: string; fileName: string }[]>(
        "/photos/batch-download",
        {
          method: "POST",
          body: JSON.stringify({ photoIds: photos.map((p) => p.id) }),
        }
      );
      // Trigger each download sequentially to avoid browser blocking
      for (const r of results) {
        const a = document.createElement("a");
        a.href = r.downloadUrl;
        a.download = r.fileName;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } catch (err) {
      console.error("Batch download failed:", err);
    }
  };

  if (eventError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-2xl font-serif text-zinc-900">Event not found</h2>
        <p className="text-zinc-500 text-center max-w-md">This event link is invalid or the event has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7F2]">
      {/* ── Hero ── */}
      <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-[1400px] mx-auto">
        <div className="relative h-64 md:h-80 overflow-hidden bg-zinc-900 rounded-[2rem] shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event?.coverImage || "/images/default-event-cover.png"}
            alt={event?.name ?? "Event"}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
          <div className="relative h-full flex flex-col items-center justify-end pb-12 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-tight drop-shadow-md">
              {event?.name ?? <span className="opacity-0">Loading</span>}
            </h1>
            <p className="text-white/80 mt-3 text-sm md:text-base font-medium drop-shadow">
              {allGalleryPhotos.length > 0 ? `${allGalleryPhotos.length}+ indexed photos` : "Event Gallery"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="sticky top-20 z-30 px-4 md:px-8 -mt-6">
        <div className="max-w-5xl mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {matchedPhotos !== null ? (
              <>
                <span className="text-sm font-medium text-zinc-700">
                  Showing <span className="text-indigo-600 font-semibold">{matchedPhotos.length}</span> photo{matchedPhotos.length !== 1 ? "s" : ""} matched to you
                </span>
                <button
                  onClick={() => setMatchedPhotos(null)}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors underline"
                >
                  <Images className="h-3.5 w-3.5" /> View all photos
                </button>
              </>
            ) : (
              <span className="text-sm text-zinc-500">
                {galleryLoading ? "Loading photos..." : `${allGalleryPhotos.length} photo${allGalleryPhotos.length !== 1 ? "s" : ""} in this event`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {matchedPhotos !== null && matchedPhotos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => handleDownloadAll(matchedPhotos.map((m) => ({ ...m, createdAt: new Date() })))}
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Download All Mine ({matchedPhotos.length})
              </Button>
            )}
            {allGalleryPhotos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => handleDownloadAll(allGalleryPhotos)}
              >
                <PackageOpen className="h-3.5 w-3.5" />
                Download All Event
              </Button>
            )}
            <Button
              className="h-10 px-6 gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-md shadow-zinc-900/10"
              onClick={() => setShowSelfieSheet(true)}
            >
              <Search className="h-4 w-4" />
              {matchedPhotos !== null ? "Search Again" : "Find My Photos"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {galleryLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : matchedPhotos !== null ? (
          /* Matched photos view */
          matchedPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-serif text-zinc-900">No matches found</h3>
              <p className="text-zinc-500 mt-2 max-w-sm">
                We couldn&apos;t find any photos of you. The photos may still be processing, or try a clearer selfie.
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setMatchedPhotos(null)} className="h-11 px-6">
                  <Images className="mr-2 h-4 w-4" /> View All Photos
                </Button>
                <Button onClick={() => setShowSelfieSheet(true)} className="h-11 px-6">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
              {matchedPhotos.map((photo, i) => {
                const asGallery: GalleryPhoto = { ...photo, createdAt: new Date() };
                const sourceList = matchedPhotos.map((m) => ({ ...m, createdAt: new Date() }));
                return (
                  <div
                    key={photo.id}
                    className="break-inside-avoid relative group overflow-hidden rounded-2xl bg-zinc-100 cursor-pointer shadow-sm ring-1 ring-zinc-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    onClick={() => openLightbox(asGallery, sourceList)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.previewUrl} alt={`Your photo ${i + 1}`} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(asGallery); }}
                        className="ml-auto p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border border-white/30 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : allGalleryPhotos.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Images className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-serif text-zinc-900">No photos yet</h3>
            <p className="text-zinc-500 mt-2">The photographer hasn&apos;t uploaded any photos to this event yet. Check back soon!</p>
          </div>
        ) : (
          /* Full event gallery */
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
              {allGalleryPhotos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid relative group overflow-hidden rounded-2xl bg-zinc-100 cursor-pointer shadow-sm ring-1 ring-zinc-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  onClick={() => openLightbox(photo, allGalleryPhotos)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt={`Event photo ${i + 1}`} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border border-white/30 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-10"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more...</>
                  ) : (
                    "Load More Photos"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Selfie Sheet (modal) ── */}
      {showSelfieSheet && (
        <SelfieSheet
          eventId={eventId}
          onClose={() => setShowSelfieSheet(false)}
          onMatches={(photos) => {
            setMatchedPhotos(photos);
            setShowSelfieSheet(false);
          }}
        />
      )}

      {/* ── Lightbox ── */}
      {lightboxPhotos && (
        <Lightbox
          photos={lightboxPhotos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxPhotos(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
