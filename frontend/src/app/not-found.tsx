import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-[#FAF7F2] min-h-[calc(100vh-4rem)]">
      <div className="bg-white/50 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-zinc-200 shadow-xl max-w-lg w-full">
        <div className="mx-auto w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <SearchX className="h-10 w-10 text-zinc-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-zinc-900 mb-4">
          Page not found
        </h1>
        <p className="text-zinc-500 mb-8 text-lg">
          We couldn't find the page you were looking for. It might have been moved or the event link may have expired.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "rounded-full h-14 px-8 bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg")}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
