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
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#FAF7F2] py-8">
      <div className="container mx-auto px-4 max-w-[600px] w-full -mt-10">
        <div className="mb-10 text-center relative">
          <Link href="/dashboard" className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-200/50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[2.2rem] font-serif font-medium text-zinc-900">Create New Event</h1>
          <p className="text-zinc-500 mt-2 font-light">Let&apos;s set up your event.</p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-zinc-200/50 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50/50 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-900">Event Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Olivia & James Wedding"
                className={cn(
                  "h-12 bg-transparent border-zinc-200 rounded-xl px-4 text-base focus:border-amber-700/30 focus:ring-amber-700/20 transition-all",
                  errors.name && "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/10"
                )}
              />
              {errors.name && <p className="text-[13px] text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="description" className="text-sm font-medium text-zinc-900">Description (Optional)</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="A brief description of the event"
                className="h-12 bg-transparent border-zinc-200 rounded-xl px-4 text-base focus:border-amber-700/30 focus:ring-amber-700/20 transition-all"
              />
              {errors.description && <p className="text-[13px] text-red-500 font-medium">{errors.description.message}</p>}
            </div>

            <div className="space-y-2.5 pt-2">
              <Label htmlFor="coverImage" className="text-sm font-medium text-zinc-900">Cover Image URL (Optional)</Label>
              <div className="relative border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-2xl bg-zinc-50/50 p-6 flex flex-col items-center justify-center transition-colors">
                <ImageIcon className="h-8 w-8 text-zinc-300 mb-3" />
                <p className="text-sm text-zinc-500 font-medium mb-3">Paste an image URL for the cover</p>
                <Input
                  id="coverImage"
                  {...register("coverImage")}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 bg-white border-zinc-200 rounded-lg px-4 text-sm w-full max-w-sm focus:border-amber-700/30 focus:ring-amber-700/20"
                />
                {errors.coverImage && <p className="text-[13px] text-red-500 font-medium mt-2">{errors.coverImage.message}</p>}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 text-base font-medium shadow-sm transition-transform hover:scale-[1.01]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Create Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
