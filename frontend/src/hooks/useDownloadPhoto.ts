import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";

/**
 * useDownloadPhoto — React Query mutation hook per §7.
 *
 * Single-photo download (screen #5 lightbox). Fetches a presigned
 * S3 GET URL for the high-res original and triggers a browser download.
 *
 * Per BACKEND_PLAN §12: this is the single-photo download path,
 * attached to each photo/in the lightbox.
 */

interface DownloadResult {
  id: string;
  downloadUrl: string;
  fileName: string;
}

export function useDownloadPhoto() {
  return useMutation({
    mutationFn: async ({ photoId, token }: { photoId: string; token?: string }) => {
      const url = token 
        ? `/photos/${photoId}/download?token=${encodeURIComponent(token)}`
        : `/photos/${photoId}/download`;
        
      const result = await fetchApi<DownloadResult>(url);

      // Trigger browser download
      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = result.fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return result;
    },
  });
}
