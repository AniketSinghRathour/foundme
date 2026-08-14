"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchApi } from "@/lib/apiClient";
import { Event } from "@/types/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

const createEventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // Remove empty strings to undefined
      const payload = {
        ...data,
        coverImage: data.coverImage === "" ? undefined : data.coverImage,
      };

      const newEvent = await fetchApi<Event>("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      queryClient.invalidateQueries({ queryKey: ["created-events"] });
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "mb-4 -ml-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center inline-flex w-fit")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-serif font-medium text-zinc-900 dark:text-zinc-50">Create New Event</h1>
        <p className="text-zinc-500 mt-1">Set up a new space for your photos.</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Event Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. Summer Music Festival 2026"
              className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="A brief description of the event"
              className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-sm font-medium">Cover Image URL (Optional)</Label>
            <Input
              id="coverImage"
              {...register("coverImage")}
              placeholder="https://example.com/image.jpg"
              className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
            {errors.coverImage && <p className="text-sm text-red-500">{errors.coverImage.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "h-12 px-6 flex items-center")}>
               Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
