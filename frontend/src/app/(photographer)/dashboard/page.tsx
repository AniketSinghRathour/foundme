"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { CreatedEvent, CreatedEventSchema } from "@/types/api";
import { z } from "zod";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Search, ChevronDown, Images, Check } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["created-events"],
    queryFn: () => fetchApi<CreatedEvent[]>("/events", { schema: z.array(CreatedEventSchema) }),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z">("newest");

  const filteredAndSortedEvents = useMemo(() => {
    if (!events) return [];
    
    let processed = [...events];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      processed = processed.filter(e => e.name.toLowerCase().includes(q));
    }

    // Sort
    processed.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "a-z") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return processed;
  }, [events, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 pt-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-8 sm:mb-10">
          <div className="flex flex-col min-w-0">
            <h1 className="text-3xl sm:text-[2.5rem] font-serif font-medium text-zinc-900 leading-tight truncate">Your Events.</h1>
          </div>
          <Link href="/dashboard/events/new" className={cn(buttonVariants({ size: "default" }), "shrink-0 rounded-full px-4 sm:px-6 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-transform hover:scale-[1.02] flex items-center")}>
            <Plus className="mr-1.5 sm:mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">New Event</span>
          </Link>
        </div>

        {/* Toolbar (Search & Sort) */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 pb-6 border-b border-zinc-200/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700/30 transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="font-medium text-zinc-500">Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 font-medium hover:text-zinc-900 transition-colors focus:outline-none">
                {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "A-Z"} <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setSortBy("newest")} className="flex justify-between items-center cursor-pointer">
                  Newest {sortBy === "newest" && <Check className="h-4 w-4 text-amber-700" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")} className="flex justify-between items-center cursor-pointer">
                  Oldest {sortBy === "oldest" && <Check className="h-4 w-4 text-amber-700" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("a-z")} className="flex justify-between items-center cursor-pointer">
                  Name (A-Z) {sortBy === "a-z" && <Check className="h-4 w-4 text-amber-700" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl border border-zinc-200/50 bg-white overflow-hidden h-[340px] animate-pulse">
                <div className="h-48 bg-zinc-100" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-zinc-100 rounded w-2/3" />
                  <div className="h-4 bg-zinc-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredAndSortedEvents.map((event) => {
              const displayImage = event.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600";

              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group block h-full">
                  <div className="rounded-3xl border border-zinc-200/60 bg-white overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative h-48 bg-zinc-100 overflow-hidden">
                      <Image 
                        src={displayImage} 
                        alt={event.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[17px] font-semibold text-zinc-900 mb-1 truncate group-hover:text-amber-700/90 transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex flex-col text-sm text-zinc-500 mb-2 font-light mt-auto">
                        <span>{new Date(event.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &middot; {event.photoCount || 0} photos</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-zinc-300/50 rounded-3xl bg-white/50">
            <div className="h-20 w-20 bg-white shadow-sm border border-zinc-100 rounded-full flex items-center justify-center mb-6">
              <Images className="h-10 w-10 text-amber-700/40" />
            </div>
            <h2 className="text-2xl font-serif text-zinc-900 mb-2">No events found</h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto font-light">
              Get started by creating your first event to upload and share photos.
            </p>
            <Link href="/dashboard/events/new" className={cn(buttonVariants({ size: "default" }), "rounded-full px-8 bg-zinc-900 text-white hover:bg-zinc-800")}>
              Create an Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
