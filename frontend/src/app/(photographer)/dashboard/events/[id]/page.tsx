"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { Event, Photo } from "@/types/api";
import { Uploader } from "@/components/photographer/Uploader";
import { ShareLinkCard } from "@/components/photographer/ShareLinkCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { use, useState, useCallback, useEffect } from "react";
import { ArrowLeft, Loader2, Calendar, Settings, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, X, Download, ZoomIn, Edit2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type StatusFilter = "ALL" | "INDEXED" | "PENDING" | "FAILED";

const STATUS_TABS: { key: StatusFilter; label: string; color: string }[] = [
  { key: "ALL", label: "All", color: "" },
  { key: "INDEXED", label: "Indexed", color: "text-emerald-600" },
  { key: "PENDING", label: "Processing", color: "text-amber-600" },
  { key: "FAILED", label: "Failed", color: "text-red-600" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Photo Lightbox ──────────────────────────────────────────────────────────

interface LightboxProps {
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
  onDownload: (photo: Photo) => void;
}

function PhotoLightbox({ photos, startIndex, onClose, onDownload }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length]);
  const next = useCallback(() => setCurrent((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length]);

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
  const src = photo.previewUrl ?? photo.r2KeyPreview ?? "";

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center" onClick={onClose}>
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm font-medium">{current + 1} / {photos.length}</span>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "text-[10px] font-medium border-0",
              photo.status === "INDEXED" && "bg-emerald-500/80 text-white",
              photo.status === "PENDING" && "bg-amber-500/80 text-white",
              photo.status === "FAILED" && "bg-red-500/80 text-white",
            )}
          >
            {photo.status}
          </Badge>
          {photo.status === "INDEXED" && (
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              onClick={() => onDownload(photo)}
            >
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
          )}
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Photo" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-zinc-600">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2 justify-center">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all relative",
                i === current ? "border-white scale-110" : "border-white/20 opacity-50 hover:opacity-80"
              )}
            >
              {p.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-zinc-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EventDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", resolvedParams.id],
    queryFn: async () => {
      const data = await fetchApi<Event>(`/events/${resolvedParams.id}`);
      setEditForm({ name: data.name, description: data.description || "" });
      return data;
    }
  });

  const { data: statusCounts, refetch: refetchStatus } = useQuery({
    queryKey: ["event-status", resolvedParams.id],
    queryFn: () => fetchApi<{ pending: number; indexed: number; failed: number }>(`/events/${resolvedParams.id}/status`),
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ["event-stats", resolvedParams.id],
    queryFn: () => fetchApi<{ totalSearches: number; totalPhotosFound: number }>(`/events/${resolvedParams.id}/stats`),
    refetchInterval: 15000,
  });

  const { data: photos, refetch: refetchPhotos } = useQuery({
    queryKey: ["event-photos", resolvedParams.id],
    queryFn: () => fetchApi<Photo[]>(`/photos?eventId=${resolvedParams.id}`),
    refetchInterval: 10000,
  });

  const filteredPhotos = (photos ?? []).filter((p) =>
    statusFilter === "ALL" ? true : p.status === statusFilter
  );

  const handleDeleteEvent = async () => {
    try {
      setIsDeletingEvent(true);
      await fetchApi(`/events/${resolvedParams.id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["created-events"] });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event. Please try again.");
      setIsDeletingEvent(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    
    try {
      setIsUpdatingEvent(true);
      await fetchApi(`/events/${resolvedParams.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      await queryClient.invalidateQueries({ queryKey: ["event", resolvedParams.id] });
      await queryClient.invalidateQueries({ queryKey: ["created-events"] });
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Failed to update event", err);
      alert("Failed to update event. Please try again.");
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  const handleDeletePhotos = async (photoIds: string[]) => {
    try {
      setIsDeletingPhotos(true);
      await fetchApi(`/photos/batch`, {
        method: "DELETE",
        body: JSON.stringify({ photoIds }),
      });
      setSelectedPhotos(new Set());
      refetchPhotos();
      refetchStatus();
    } catch (err) {
      console.error("Failed to delete photos", err);
      alert("Failed to delete photos. Please try again.");
    } finally {
      setIsDeletingPhotos(false);
    }
  };

  const handleDownload = async (photo: Photo) => {
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

  const togglePhotoSelection = (id: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedPhotos(newSelection);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-serif text-red-500">Failed to load event</h2>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-12">
            {/* Header */}
            <div>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "mb-4 -ml-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center inline-flex w-fit")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
            <div className="flex gap-6 items-end">
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {event.name}
                </h1>
                <div className="flex items-center text-sm text-zinc-500 mt-2">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Created {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "hidden md:flex text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
                  )}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete <strong>{event.name}</strong>, wiping all photos and recognition indexes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteEvent}
                      disabled={isDeletingEvent}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeletingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete event"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "hidden md:flex")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Event Settings</DialogTitle>
                    <DialogDescription>
                      Update the details of your event.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateEvent} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="My Awesome Event"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Tell your attendees about this event..."
                        rows={3}
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUpdatingEvent || !editForm.name.trim()}>
                        {isUpdatingEvent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
            
        {/* Upload Zone */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Upload Photos</h2>
                <p className="text-sm text-zinc-500">Photos will be automatically indexed for face recognition.</p>
              </div>
              <Uploader eventId={resolvedParams.id} />
            </section>

            {/* Gallery */}
            <section>
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Photo Gallery</h2>
                    <p className="text-sm text-zinc-500">
                      {filteredPhotos.length} of {photos?.length ?? 0} photo{photos?.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {selectedPhotos.size > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete {selectedPhotos.size} Photo{selectedPhotos.size > 1 ? "s" : ""}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {selectedPhotos.size} photo{selectedPhotos.size > 1 ? "s" : ""}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes these photos from cloud storage and search indexes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePhotos(Array.from(selectedPhotos))}
                            disabled={isDeletingPhotos}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isDeletingPhotos ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {/* Status filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit">
                  {STATUS_TABS.map((tab) => {
                    const count =
                      tab.key === "ALL" ? (photos?.length ?? 0) :
                      tab.key === "INDEXED" ? (statusCounts?.indexed ?? 0) :
                      tab.key === "PENDING" ? (statusCounts?.pending ?? 0) :
                      (statusCounts?.failed ?? 0);
                    return (
                      <button
                        key={tab.key}
                        onClick={() => { setStatusFilter(tab.key); setSelectedPhotos(new Set()); }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                          statusFilter === tab.key
                            ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                      >
                        {tab.label}
                        <span className={cn("text-[10px] font-semibold", tab.color, statusFilter === tab.key && tab.color)}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Failed photos info banner */}
              {statusFilter === "FAILED" && filteredPhotos.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    These photos failed to process. This may be due to an unsupported format, a corrupt file, or a Lambda timeout. You can delete and re-upload them.
                  </p>
                </div>
              )}

              {!photos ? (
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-zinc-200 rounded-3xl">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50">
                  <ImageIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-sm text-zinc-500">
                    {statusFilter === "ALL" ? "No photos uploaded yet." : `No ${statusFilter.toLowerCase()} photos.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredPhotos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className={cn(
                        "relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all",
                        selectedPhotos.has(photo.id)
                          ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950"
                          : "hover:ring-2 hover:ring-zinc-300 hover:ring-offset-2 dark:hover:ring-zinc-700"
                      )}
                    >
                      {/* Click to open lightbox */}
                      <div
                        className="absolute inset-0 z-10"
                        onClick={() => {
                          const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
                          setLightboxIndex(idx >= 0 ? idx : i);
                        }}
                      />

                      {photo.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.previewUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                          {photo.status === "FAILED" ? (
                            <AlertCircle className="h-6 w-6 text-red-400" />
                          ) : (
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                          )}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Zoom icon */}
                      <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <ZoomIn className="h-3.5 w-3.5" />
                      </div>

                      {/* Download button */}
                      {photo.status === "INDEXED" && photo.previewUrl && (
                        <button
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Selection checkbox */}
                      <div
                        className={cn(
                          "absolute bottom-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors z-20",
                          selectedPhotos.has(photo.id)
                            ? "bg-indigo-500 border-indigo-500 text-white"
                            : "border-white/50 bg-black/20 opacity-0 group-hover:opacity-100"
                        )}
                        onClick={(e) => { e.stopPropagation(); togglePhotoSelection(photo.id); }}
                      >
                        {selectedPhotos.has(photo.id) && <CheckCircle2 className="h-3 w-3" />}
                      </div>

                      {/* Status badge */}
                      <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
                        {photo.status === "INDEXED" && (
                          <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-600/90 border-0 text-[10px] px-1.5 py-0">
                            Indexed
                          </Badge>
                        )}
                        {photo.status === "PENDING" && (
                          <Badge className="bg-zinc-900/90 text-white hover:bg-zinc-900/90 border-0 text-[10px] px-1.5 py-0 flex items-center">
                            <Loader2 className="mr-1 h-2 w-2 animate-spin" /> Pending
                          </Badge>
                        )}
                        {photo.status === "FAILED" && (
                          <Badge className="bg-red-500/90 text-white hover:bg-red-600/90 border-0 text-[10px] px-1.5 py-0 flex items-center">
                            <AlertCircle className="mr-1 h-2 w-2" /> Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
          <div className="space-y-8 lg:sticky lg:top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ShareLinkCard eventId={resolvedParams.id} eventName={event.name} />

            {/* Stats Card */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Indexing Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Indexed &amp; Ready</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">{statusCounts?.indexed ?? 0}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 flex items-center">
                    Processing {statusCounts?.pending ? <Loader2 className="ml-2 h-3 w-3 animate-spin" /> : null}
                  </span>
                  <span className="font-semibold text-amber-600 text-lg">{statusCounts?.pending ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Failed</span>
                  <span className={cn("font-medium text-sm", (statusCounts?.failed ?? 0) > 0 ? "text-red-500 font-semibold text-lg" : "text-zinc-400")}>
                    {statusCounts?.failed ?? 0}
                  </span>
                </div>
              </div>
              {(statusCounts?.failed ?? 0) > 0 && (
                <button
                  onClick={() => setStatusFilter("FAILED")}
                  className="mt-4 w-full text-xs text-red-500 hover:text-red-700 transition-colors text-center underline underline-offset-2"
                >
                  View failed photos →
                </button>
              )}
            </div>

            {/* Analytics Card */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Total Searches</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                    {stats?.totalSearches ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Photos Found</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-lg">
                    {stats?.totalPhotosFound ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && filteredPhotos.length > 0 && (
        <PhotoLightbox
          photos={filteredPhotos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}
