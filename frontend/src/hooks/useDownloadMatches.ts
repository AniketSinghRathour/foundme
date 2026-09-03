import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";

/**
 * useDownloadMatches — React Query mutation hook per §7.
 *
 * Bulk download of the current matched-photo set (screen #8).
 * Fetches an array of presigned S3 GET URLs in one request,
 * then triggers sequential browser downloads.
 *
 * Per BACKEND_PLAN §12: this is NOT "download entire event" —
 * it's download-of-matched-results only.
 */

interface DownloadResult {
  id: string;
  downloadUrl: string;
  fileName: string;
}

export function useDownloadMatches() {
  return useMutation({
    mutationFn: async ({ photoIds, token }: { photoIds: string[]; token?: string }) => {
      const results = await fetchApi<DownloadResult[]>(
        "/photos/batch-download",
        {
          method: "POST",
          body: JSON.stringify({ photoIds, token }),
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
        // Small delay between downloads to prevent browser throttling
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return results;
    },
  });
}
