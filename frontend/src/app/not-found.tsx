import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";

/**
 * Custom 404 page — system state per §13 step 13.
 */
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-[#FAF7F2]">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8">
          <Camera className="h-10 w-10 text-zinc-400" />
        </div>
        <h1 className="text-6xl font-serif font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-serif text-zinc-700 dark:text-zinc-300 mb-4">
          Page not found
        </h2>
        <p className="text-zinc-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full h-12 px-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            )}
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full h-12 px-8"
            )}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
