"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { Event } from "@/types/api";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Calendar, Image as ImageIcon, Search } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["created-events"],
    queryFn: () => fetchApi<Event[]>("/events"),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage your events and photo uploads.</p>
        </div>
        <Link href="/dashboard/events/new" className={cn(buttonVariants(), "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 flex items-center")}>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden h-[300px] animate-pulse">
              <div className="h-48 bg-zinc-100 dark:bg-zinc-900" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-zinc-100 dark:bg-zinc-900 rounded w-2/3" />
                <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group block h-full">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden h-full flex flex-col transition-all hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  {event.coverImage ? (
                    <Image 
                      src={event.coverImage} 
                      alt={event.name} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2 truncate">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-sm text-zinc-500 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
            <Search className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-2">No events found</h2>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            Get started by creating your first event to share photos with your attendees.
          </p>
          <Link href="/dashboard/events/new" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-zinc-900 text-white hover:bg-zinc-800")}>
            Create an Event
          </Link>
        </div>
      )}
    </div>
  );
}
