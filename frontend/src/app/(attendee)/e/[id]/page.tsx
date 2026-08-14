import { AttendeeFlow } from "@/components/attendee/AttendeeFlow";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AttendeeEventPage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <div className="flex-1 bg-[#FAF7F2] min-h-[calc(100vh-4rem)]">
      <AttendeeFlow eventId={resolvedParams.id} />
    </div>
  );
}
