"use client";

import { useState } from "react";
import { Upload, ScanFace, Image as ImageIcon, Link as LinkIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"attendee" | "photographer">("photographer");

  return (
    <section className="py-16 md:py-24 bg-[#FAF7F2]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-6">How it works</h2>
          <div className="inline-flex bg-zinc-200/50 p-1.5 rounded-full">
            <button
              onClick={() => setActiveTab("photographer")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "photographer" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              For Photographers
            </button>
            <button
              onClick={() => setActiveTab("attendee")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "attendee" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              For Attendees
            </button>
          </div>
        </div>

        {activeTab === "photographer" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="border-t border-zinc-300 pt-6">
                <span className="text-4xl font-serif text-zinc-900 mb-4 block">1</span>
                <h3 className="text-xl font-medium text-zinc-900 mb-2">Upload your event photos</h3>
                <p className="text-zinc-500 mb-6">Upload event photos to your private gallery in seconds.</p>
                <Camera className="h-6 w-6 text-amber-600/70" />
              </div>
              <div className="border-t border-zinc-300 pt-6">
                <span className="text-4xl font-serif text-zinc-900 mb-4 block">2</span>
                <h3 className="text-xl font-medium text-zinc-900 mb-2">We auto-index every face</h3>
                <p className="text-zinc-500 mb-6">We auto-index every face for seamless sorting and delivery.</p>
                <ScanFace className="h-6 w-6 text-amber-600/70" />
              </div>
              <div className="border-t border-zinc-300 pt-6">
                <span className="text-4xl font-serif text-zinc-900 mb-4 block">3</span>
                <h3 className="text-xl font-medium text-zinc-900 mb-2">Share one link with everyone</h3>
                <p className="text-zinc-500 mb-6">Share one link with everyone at the event to let them find their photos.</p>
                <LinkIcon className="h-6 w-6 text-amber-600/70" />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="border-t border-zinc-300 pt-6">
                <span className="text-4xl font-serif text-zinc-900 mb-4 block">1</span>
                <h3 className="text-xl font-medium text-zinc-900 mb-2">Upload a selfie</h3>
                <p className="text-zinc-500 mb-6">Upload a selfie. We'll find every photo you're in — automatically.</p>
                <Upload className="h-6 w-6 text-amber-600/70" />
              </div>
              <div className="border-t border-zinc-300 pt-6">
                <span className="text-4xl font-serif text-zinc-900 mb-4 block">2</span>
                <h3 className="text-xl font-medium text-zinc-900 mb-2">We search every photo</h3>
                <p className="text-zinc-500 mb-6">Our facial recognition engine scans the entire event gallery to find every picture you appear in.</p>
                <ScanFace className="h-6 w-6 text-amber-600/70" />
              </div>
              <div className="border-t border-zinc-300 pt-6">
                <span className="text-4xl font-serif text-zinc-900 mb-4 block">3</span>
                <h3 className="text-xl font-medium text-zinc-900 mb-2">Get your matches instantly</h3>
                <p className="text-zinc-500 mb-6">View, download, and share your personal moments from the event with a single tap.</p>
                <ImageIcon className="h-6 w-6 text-amber-600/70" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
