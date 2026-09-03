"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

/**
 * Bulk download button — screen #8 per §5.
 *
 * Downloads all matched photos by fetching presigned S3 download
 * URLs in one batch request, then triggering sequential downloads.
 *
 * Only visible once there are matches. Does NOT download the entire
 * event — only the specific matched-photo set (§6: "download entire
 * event" is explicitly out of scope).
 */

interface BulkDownloadButtonProps {
 photoIds: string[];
 token?: string;
 label?: string;
 className?: string;
}

export function BulkDownloadButton({
 photoIds,
 token,
 label,
 className,
}: BulkDownloadButtonProps) {
 const [isDownloading, setIsDownloading] = useState(false);

 const handleBulkDownload = async () => {
 if (photoIds.length === 0) return;
 setIsDownloading(true);

 try {
 const results = await fetchApi<
 { id: string; downloadUrl: string; fileName: string }[]
 >("/photos/batch-download", {
 method: "POST",
 body: JSON.stringify({ photoIds, token }),
 });

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
 } catch (err) {
 console.error("Batch download failed:", err);
 } finally {
 setIsDownloading(false);
 }
 };

 if (photoIds.length === 0) return null;

 return (
 <Button
 variant="outline"
 size="sm"
 className={cn("text-xs gap-1.5", className)}
 onClick={handleBulkDownload}
 disabled={isDownloading}
 >
 {isDownloading ? (
 <>
 <Loader2 className="h-3.5 w-3.5 animate-spin" />
 Downloading...
 </>
 ) : (
 <>
 <ArrowDownToLine className="h-3.5 w-3.5" />
 {label || `Download All (${photoIds.length})`}
 </>
 )}
 </Button>
 );
}
