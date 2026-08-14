"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-[#FAF7F2] min-h-[calc(100vh-4rem)]">
      <div className="bg-white/50 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-red-100 shadow-xl max-w-lg w-full">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertOctagon className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-zinc-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-zinc-500 mb-8 text-lg">
          An unexpected error occurred while processing your request. Please try again.
        </p>
        <Button onClick={reset} size="lg" className="rounded-full h-14 px-8 bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg">
          <RotateCcw className="mr-2 h-5 w-5" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
