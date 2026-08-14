"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAccountCapabilities } from "@/hooks/useAccountCapabilities";
import { Upload } from "lucide-react";
import { useState, useEffect } from "react";

export function DualCTA() {
  const { isAuthenticated, isPhotographer, isLoading } = useAccountCapabilities();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full bg-[#FAF7F2] px-4 pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-zinc-500">
            Two ways to use FoundMe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:h-[600px]">
          {/* Attendee Card */}
          <div className="relative group rounded-3xl overflow-hidden h-[500px] sm:h-[550px] md:h-auto md:min-h-[500px] lg:h-full">
            <Image
              src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1000"
              alt="Happy attendee at festival"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-8 lg:p-12 w-full">
              <span className="text-xs font-semibold tracking-wider uppercase text-white/70 mb-4 block">
                For Attendees
              </span>
              <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-serif text-white leading-tight mb-4">
                Find your<br />photos.
              </h3>
              <p className="text-lg text-white/80 mb-8 max-w-sm">
                Upload a selfie, discover every moment you were in — instantly.
              </p>
              <Link 
                href={!mounted || isLoading ? "#" : isAuthenticated ? "/account" : "/sign-up"} 
                className={cn(buttonVariants({ size: "lg" }), "rounded-full h-12 px-8 text-base bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl")}
              >
                Find My Photos
              </Link>
            </div>
          </div>

          {/* Photographer Card */}
          <div className="relative group rounded-3xl overflow-hidden h-[500px] sm:h-[550px] md:h-auto md:min-h-[500px] lg:h-full">
            <Image
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000"
              alt="Photographer taking pictures"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-8 lg:p-12 w-full">
              <span className="text-xs font-semibold tracking-wider uppercase text-white/70 mb-4 block">
                For Photographers
              </span>
              <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-serif text-white leading-tight mb-4">
                Deliver photos<br />effortlessly.
              </h3>
              <p className="text-lg text-white/80 mb-8 max-w-sm">
                Upload your shoot. We handle sorting, matching, and delivery.
              </p>
              <Link 
                href={!mounted || isLoading ? "#" : (isAuthenticated && isPhotographer) ? "/dashboard/events/new" : "/sign-up"} 
                className={cn(buttonVariants({ size: "lg" }), "rounded-full h-12 px-8 text-base bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl")}
              >
                Start an Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
