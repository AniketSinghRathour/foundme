"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Explicit "Load More" button per §9 — NOT silent auto-loading
 * infinite scroll. Gives the user control and avoids disorientation.
 *
 * Smooth, non-jarring append (§8 micro-interaction spec).
 */

interface LoadMoreButtonProps {
 onClick: () => void;
 isLoading: boolean;
 hasMore: boolean;
}

export function LoadMoreButton({
 onClick,
 isLoading,
 hasMore,
}: LoadMoreButtonProps) {
 if (!hasMore) return null;

 return (
 <div className="flex justify-center mt-10">
 <Button
 variant="outline"
 size="lg"
 className="h-12 px-10 rounded-full border-zinc-300 hover:border-zinc-400 :border-zinc-600 transition-all"
 onClick={onClick}
 disabled={isLoading}
 >
 {isLoading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Loading more...
 </>
 ) : (
 "Load More Photos"
 )}
 </Button>
 </div>
 );
}
