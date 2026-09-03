"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const joinEventSchema = z.object({
  eventLink: z.string().min(1, "Please enter an event link or ID."),
});

type JoinEventFormValues = z.infer<typeof joinEventSchema>;

export function JoinEventForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<JoinEventFormValues>({
    resolver: zodResolver(joinEventSchema),
    defaultValues: {
      eventLink: "",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (values: JoinEventFormValues) => {
    setError("");

    const val = values.eventLink.trim();
    if (!val) {
      setError("Please enter an event link or ID.");
      return;
    }

    let eventId = val;
    // Check if it's a URL
    try {
      if (val.includes("http") || val.includes("localhost") || val.includes("/")) {
        const urlObj = new URL(val.startsWith("http") ? val : `https://${val}`);
        // Assuming event links look like: domain.com/e/event-id
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        const eIndex = pathParts.indexOf("e");
        
        if (eIndex !== -1 && pathParts.length > eIndex + 1) {
          eventId = pathParts[eIndex + 1];
        } else {
          // If we couldn't parse the path structure exactly, fallback to the last segment
          eventId = pathParts[pathParts.length - 1];
        }
      }
    } catch {
      // It's not a valid URL format, assume it's just the raw ID
      eventId = val;
    }

    // Clean any trailing slashes or queries if they somehow slipped through
    eventId = eventId.split("?")[0].replace(/\/$/, "");

    if (!eventId || eventId.length < 3) {
      setError("Invalid event link or ID.");
      return;
    }

    // Navigate to the attendee event flow
    router.push(`/e/${eventId}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-zinc-200 shadow-xl overflow-hidden rounded-[2rem] p-2">
      <CardHeader className="space-y-2 text-center pb-6 pt-8">
        <CardTitle className="text-3xl font-serif tracking-tight text-zinc-900">
          Find your photos
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Paste your event link or enter your unique event ID below to access your gallery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="eventLink" className="sr-only">Event Link or ID</Label>
            <Input
              id="eventLink"
              type="text"
              placeholder="e.g. https://facet.com/e/cm29asdf82"
              {...register("eventLink")}
              className="h-11 bg-white text-base"
              autoFocus
            />
            {errors.eventLink && (
              <p className="text-xs text-red-500 mt-1">{errors.eventLink.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 font-medium transition-all"
          >
            <Search className="mr-2 h-4 w-4" />
            Go to Event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
