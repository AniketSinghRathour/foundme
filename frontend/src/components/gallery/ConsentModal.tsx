"use client";

import { Button } from "@/components/ui/button";
import { ShieldCheck, X } from "lucide-react";

/**
 * Consent modal — screen #6 per §5.
 *
 * Shown at the moment "Find My Photos" is triggered (§4):
 * - NOT a blanket gate on the whole event page
 * - NOT a separate route — a modal/step
 * - Gates specifically the face-search action
 *
 * Browsing photos requires no biometric processing and
 * therefore no consent step.
 */

interface ConsentModalProps {
 onAccept: () => void;
 onClose: () => void;
}

export function ConsentModal({ onAccept, onClose }: ConsentModalProps) {
 return (
 <div
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
 onClick={onClose}
 >
 <div
 className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-6 space-y-5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
 <ShieldCheck className="h-5 w-5 text-zinc-600 " />
 </div>
 <h2 className="text-xl font-serif text-zinc-900 ">
 Face Recognition Consent
 </h2>
 </div>
 <button
 onClick={onClose}
 className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
 >
 <X className="h-5 w-5 text-zinc-500" />
 </button>
 </div>

 <div className="space-y-3 text-sm text-zinc-600 ">
 <p>
 To find your photos, we&apos;ll use facial recognition to compare
 your selfie against photos in this event. Here&apos;s what you
 should know:
 </p>
 <ul className="space-y-2 list-disc list-inside">
 <li>
 Your selfie is processed in real-time and{" "}
 <strong className="text-zinc-900 ">
 never stored
 </strong>
 .
 </li>
 <li>
 The comparison happens securely using AWS Rekognition — your
 image data is not retained after the search.
 </li>
 <li>
 No account is created and no personal data is saved from this
 process.
 </li>
 </ul>
 </div>

 <div className="flex gap-3 pt-2">
 <Button
 variant="outline"
 onClick={onClose}
 className="flex-1 h-11"
 >
 Cancel
 </Button>
 <Button
 onClick={onAccept}
 className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-white"
 >
 I Agree — Continue
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
}
