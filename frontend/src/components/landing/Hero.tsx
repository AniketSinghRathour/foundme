"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
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

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F2] px-4 pt-8 md:pt-12 pb-8 md:pb-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative w-full rounded-[2rem] overflow-hidden min-h-[550px] sm:min-h-[600px] md:min-h-[500px] aspect-[4/5] sm:aspect-square md:aspect-[16/9] lg:aspect-[21/10] bg-zinc-900 shadow-2xl">
          {/* Background Image */}
          <Image
            src="/Gemini_Generated_Image_ggkx1eggkx1eggkx (1).png"
            alt="Festival crowd"
            fill
            sizes="100vw"
            priority
            className="object-cover object-[70%_center] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 md:bg-gradient-to-r md:from-black/70 md:via-black/30 md:to-black/10" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-12 lg:p-16 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.05] mb-4 sm:mb-6">
              Find yourself in<br />every moment.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-200 mb-6 sm:mb-8 max-w-[260px] sm:max-w-md md:max-w-lg">
              Upload a selfie. We'll find every photo you're in — automatically.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href={!mounted || isLoading ? "#" : isAuthenticated ? "/account" : "/sign-up"} 
                className={cn(buttonVariants({ size: "lg" }), "rounded-full h-14 px-8 text-lg bg-white text-zinc-900 hover:bg-zinc-100 transition-all hover:scale-105 shadow-xl")}
              >
                Find My Photos
              </Link>
            </div>
          </div>

          {/* Floating UI Elements matching design */}
          <div className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-sm">
              <Image 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" 
                alt="Face scanning" 
                fill 
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.5)] animate-[ping_3s_infinite]" />
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
