import { create } from "zustand";
import { fetchApi } from "@/lib/apiClient";

export type UploadStatus = "IDLE" | "PREPARING" | "UPLOADING" | "SUCCESS" | "ERROR";

export interface UploadItem {
  id: string; // unique local id (e.g. filename + timestamp)
  file: File;
  status: UploadStatus;
  progress: number; // 0 to 100
  error?: string;
  presignedUrl?: string;
  s3Key?: string;
}

interface UploadState {
  items: UploadItem[];
  isUploading: boolean;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
  startUpload: (eventId: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<UploadItem>) => void;
}

/**
 * Backend response shape from POST /api/photos/upload-urls.
 * Returns an array in the same order as the request's `files` array.
 */
interface PresignedUrlResult {
  fileName: string;
  s3KeyOriginal: string;
  uploadUrl: string;
  photoId: string;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  items: [],
  isUploading: false,

  addFiles: (files) => {
    const newItems = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      file,
      status: "IDLE" as UploadStatus,
      progress: 0,
    }));
    set((state) => ({ items: [...state.items, ...newItems] }));
  },

  removeFile: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      items: state.items.filter((item) => item.status !== "SUCCESS"),
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  },

  startUpload: async (eventId: string) => {
    const { items, updateItem } = get();

    // Only upload files that are pending or previously errored
    const pendingItems = items.filter(
      (item) => item.status === "IDLE" || item.status === "ERROR"
    );

    if (pendingItems.length === 0) return;

    set({ isUploading: true });

    try {
      // Mark all pending items as preparing
      pendingItems.forEach((item) => updateItem(item.id, { status: "PREPARING" }));

      // 1. Request presigned S3 upload URLs from backend.
      //    Backend schema (batchUploadSchema) expects: { eventId, files: [{ fileName, contentType }] }
      //    Response: array of { fileName, s3KeyOriginal, uploadUrl, photoId } in the SAME ORDER.
      const presignedResults = await fetchApi<PresignedUrlResult[]>("/photos/upload-urls", {
        method: "POST",
        body: JSON.stringify({
          eventId,
          files: pendingItems.map((item) => ({
            fileName: item.file.name,      // camelCase, matches backend schema
            contentType: item.file.type,   // required by backend for S3 Content-Type header
          })),
        }),
      });

      // 2. Upload each file directly to S3 using XHR (for progress tracking)
      const uploadPromises = pendingItems.map((item, index) => {
        return new Promise<void>((resolve) => {
          const urlData = presignedResults[index];

          if (!urlData?.uploadUrl) {
            updateItem(item.id, { status: "ERROR", error: "Failed to get upload URL" });
            return resolve();
          }

          updateItem(item.id, { status: "UPLOADING", progress: 0, s3Key: urlData.s3KeyOriginal });

          const xhr = new XMLHttpRequest();
          xhr.open("PUT", urlData.uploadUrl, true);
          // S3 requires the Content-Type header to match what was used when generating the presigned URL
          xhr.setRequestHeader("Content-Type", item.file.type);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              updateItem(item.id, { progress });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              updateItem(item.id, { status: "SUCCESS", progress: 100 });
            } else {
              updateItem(item.id, {
                status: "ERROR",
                error: `Upload failed with status ${xhr.status}`,
              });
            }
            resolve();
          };

          xhr.onerror = () => {
            updateItem(item.id, { status: "ERROR", error: "Network error during upload" });
            resolve();
          };

          xhr.send(item.file);
        });
      });

      await Promise.all(uploadPromises);
    } catch (error: unknown) {
      // If the presigned URL request itself failed, mark all preparing items as errored
      const currentItems = get().items;
      currentItems
        .filter((item) => item.status === "PREPARING")
        .forEach((item) =>
          updateItem(item.id, {
            status: "ERROR",
            error: error instanceof Error ? error.message : "Failed to start upload",
          })
        );
      console.error("Upload process failed:", error);
    } finally {
      set({ isUploading: false });
    }
  },
}));
