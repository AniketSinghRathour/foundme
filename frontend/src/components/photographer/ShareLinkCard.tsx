"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShareLinkCard({ eventId, eventName }: { eventId: string, eventName: string }) {
  const [copied, setCopied] = useState(false);
  
  // Assuming the app is deployed, we'd use window.location.origin
  // but for safety in SSR, we use a placeholder or detect it
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://foundme.example.com";
  const shareUrl = `${baseUrl}/e/${eventId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-6 items-center text-center overflow-hidden w-full">
      <div className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm shrink-0 w-fit">
        <QRCodeSVG value={shareUrl} size={160} level="H" includeMargin={false} />
      </div>
      <div className="flex flex-col space-y-4 items-center w-full min-w-0">
        <div className="w-full">
          <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Share with attendees</h3>
          <p className="text-sm text-zinc-500 mt-1 w-full max-w-sm mx-auto text-balance">
            Attendees can scan this QR code or visit the link below to upload a selfie and find their photos from {eventName}.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto">
          <div className="flex-1 min-w-0 truncate bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 text-left">
            {shareUrl}
          </div>
          <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0")}>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
