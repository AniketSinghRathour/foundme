import { Quote } from "lucide-react";
import Image from "next/image";

export function Testimonial() {
  return (
    <section className="py-24 bg-zinc-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="md:w-1/3 relative">
             <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl z-10">
               <Image 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                 alt="Photographer" 
                 fill 
                 sizes="(max-width: 768px) 100vw, 33vw"
                 className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
               />
             </div>
             <div className="absolute top-0 left-0 w-full h-full bg-amber-500 rounded-full blur-[100px] opacity-20 -z-10" />
          </div>
          
          <div className="md:w-2/3 space-y-6 text-center md:text-left">
            <Quote className="h-12 w-12 text-zinc-700 mb-6 mx-auto md:mx-0" />
            <blockquote className="text-2xl md:text-4xl font-serif leading-tight">
              "Facet changed how I deliver event galleries. Instead of scrolling through thousands of photos, attendees find their moments instantly."
            </blockquote>
            <div className="pt-4">
              <div className="text-lg font-medium">Sarah Jenkins</div>
              <div className="text-zinc-400">Professional Event Photographer</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}