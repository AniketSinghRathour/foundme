import { JoinEventForm } from "@/components/guest/JoinEventForm";

export default function JoinPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#FAF7F2]">
      <div className="w-full max-w-md relative z-10 -mt-10">
        <JoinEventForm />
      </div>
    </div>
  );
}
