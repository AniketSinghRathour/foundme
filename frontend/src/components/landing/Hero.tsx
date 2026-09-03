"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAccountCapabilities } from "@/hooks/useAccountCapabilities";
import { useState, useEffect } from "react";

export function Hero() {
  const { isAuthenticated, isLoading } = useAccountCapabilities();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ctaHref =
    !mounted || isLoading
      ? "#"
      : isAuthenticated
        ? "/dashboard/events/new"
        : "/sign-up";

  return (
    <section className="relative w-full h-[100vh] min-h-[600px] max-h-[1000px] bg-zinc-950 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero_bg/hero-main.png"
        alt="Event guests"
        fill
        sizes="100vw"
        priority
        className="object-cover object-[75%_90%] lg:object-[75%_0%] 2xl:object-[center_0%]" 
        // 10% vertical crop aligns the top of the image closer to the top of the screen,
        // which pushes the entire image DOWN, lowering her face towards the center.
      />

      {/* Gradients tailored for text placement */}
      {/* Top Navbar protector: Ensures navbar text is always legible regardless of background brightness */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-zinc-950/90 to-transparent z-[2] pointer-events-none" />

      {/* Mobile & Tablet (up to lg): Text is at the bottom, so gradient comes from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent lg:hidden z-[1]" />
      
      {/* Desktop (lg and up): Text is on the left, so gradient comes from left */}
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-transparent z-[1]" />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end lg:justify-center p-6 pb-16 sm:p-12 lg:p-16 xl:px-24 w-full">
        <div className="max-w-3xl w-full text-left self-start mt-auto lg:mt-0 pt-20 lg:pt-0">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-serif text-white tracking-tighter leading-[1.05] mb-4 md:mb-5 drop-shadow-md">
            Give every guest<br />their perfect photo.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 mb-6 md:mb-8 max-w-2xl font-light leading-relaxed drop-shadow-md">
            Upload your shoot. We automatically sort and deliver every guest their own gallery — no editing, no manual tagging.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full h-14 md:h-16 px-10 md:px-12 text-lg md:text-xl bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-[1.02] transition-all duration-300 font-medium shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] shrink-0"
              )}
            >
              Start an Event
            </Link>
            <Link
              href="/join"
              className="text-white/90 hover:text-white text-sm md:text-base font-medium flex items-center gap-2 group transition-colors drop-shadow-md"
            >
              Already have an event link? Find your photos
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

