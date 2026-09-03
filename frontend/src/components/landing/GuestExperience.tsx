import Link from "next/link";
import { ArrowRight, ScanFace, Upload, Download, Camera } from "lucide-react";
import Image from "next/image";

export function GuestExperience() {
  return (
    <section className="py-12 md:py-16 bg-[#FAF7F2] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 items-center justify-between">
          
          {/* Left Side: Text */}
          <div className="w-full lg:w-[25%] flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-[13px] font-semibold tracking-[0.15em] text-amber-700/80 uppercase mb-4">
              For Your Guests
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[2.2rem] xl:text-[2.5rem] font-serif text-zinc-900 leading-[1.15] tracking-tight mb-4">
              Find your photos<br className="hidden lg:block"/> in seconds.
            </h2>
            <p className="text-base xl:text-lg text-zinc-600 mb-8 max-w-sm font-light leading-relaxed">
              Guests upload a selfie, we find their photos. It's that simple and private.
            </p>
            <Link
              href="/join"
              className="group inline-flex items-center text-amber-700/80 hover:text-amber-900 transition-colors font-medium text-sm md:text-base border-b border-transparent hover:border-amber-700/30 pb-0.5"
            >
              See guest experience
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Middle: Phone Mockup */}
          <div className="w-full lg:w-[30%] flex justify-center items-center lg:relative my-8 lg:my-0">
            <div className="relative w-[280px] h-[580px] xl:w-[300px] xl:h-[620px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[3rem] border-[8px] border-zinc-900 bg-white overflow-hidden z-10 transform transition-transform duration-700 hover:-translate-y-2">
              {/* Status bar placeholder */}
              <div className="h-8 bg-zinc-900 flex items-center justify-center">
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full" />
              </div>
              {/* Mobile UI Header */}
              <div className="pt-6 pb-4 px-5 border-b border-zinc-100 flex flex-col items-center">
                <span className="text-[11px] font-semibold text-zinc-400 mb-3 tracking-widest uppercase">Olivia & James Wedding</span>
                <div className="w-full bg-zinc-950 text-white rounded-full py-2.5 text-center text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer">
                  Find My Photos
                </div>
              </div>
              {/* Mobile UI Grid */}
              <div className="p-2 grid grid-cols-2 gap-2">
                {[
                  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300",
                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300",
                  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=300",
                  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=300",
                  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300",
                  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=300",
                ].map((src, i) => (
                  <div key={i} className="aspect-square bg-zinc-100 rounded-xl relative overflow-hidden group">
                    <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="130px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="w-full lg:w-[45%] flex items-center justify-center lg:justify-end">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-6 lg:gap-8 w-full max-w-2xl">
              
              <div className="flex-1 flex flex-col items-center text-center group cursor-default">
                <div className="h-12 w-12 flex items-center justify-center mb-3 text-amber-700/80 group-hover:text-amber-900 transition-colors relative">
                  <div className="absolute inset-0 bg-amber-700/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500 ease-out" />
                  <Camera className="w-7 h-7 stroke-[1.5] relative z-10" />
                </div>
                <h4 className="text-[15px] font-medium mb-1 text-zinc-900">Upload a selfie</h4>
                <p className="text-sm text-zinc-500 font-light">Quick and secure.</p>
              </div>

              <div className="hidden sm:block w-[1px] h-12 bg-zinc-300 mt-4" />

              <div className="flex-1 flex flex-col items-center text-center group cursor-default">
                <div className="h-12 w-12 flex items-center justify-center mb-3 text-amber-700/80 group-hover:text-amber-900 transition-colors relative">
                  <div className="absolute inset-0 bg-amber-700/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500 ease-out" />
                  <Upload className="w-7 h-7 stroke-[1.5] relative z-10" />
                </div>
                <h4 className="text-[15px] font-medium mb-1 text-zinc-900">We find your photos</h4>
                <p className="text-sm text-zinc-500 font-light">Facial recognition.</p>
              </div>

              <div className="hidden sm:block w-[1px] h-12 bg-zinc-300 mt-4" />

              <div className="flex-1 flex flex-col items-center text-center group cursor-default">
                <div className="h-12 w-12 flex items-center justify-center mb-3 text-amber-700/80 group-hover:text-amber-900 transition-colors relative">
                  <div className="absolute inset-0 bg-amber-700/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500 ease-out" />
                  <Download className="w-7 h-7 stroke-[1.5] relative z-10" />
                </div>
                <h4 className="text-[15px] font-medium mb-1 text-zinc-900">Download & enjoy</h4>
                <p className="text-sm text-zinc-500 font-light">Yours to keep.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
