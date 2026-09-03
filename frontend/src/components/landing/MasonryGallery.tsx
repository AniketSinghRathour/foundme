import Image from "next/image";
import Link from "next/link";

export function MasonryGallery() {
  const images = [
    { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/3]" }, // Former pos 3
    { src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
    { src: "/images/hero_event.jpg", aspect: "aspect-[4/5]", isHeroFilter: true }, // Swapped from pos 4
    { src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800", aspect: "aspect-square" }, // Swapped from pos 6
    { src: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[16/9]" }, // Swapped from pos 6
    { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" }, // Swapped from pos 4
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-4">See what your clients receive.</h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            A beautiful, private gallery for every guest. Simple for them. Stunning for your brand.
          </p>
          {/* <div className="mt-6">
            <Link href="#" className="text-amber-700/80 hover:text-amber-900 font-medium inline-flex items-center justify-center gap-2 group transition-colors text-base">
              View a Sample Gallery <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div> */}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <div key={i} className={`relative w-full ${img.aspect} rounded-2xl overflow-hidden group break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-500`}>
              <Image 
                src={img.src} 
                alt={`Gallery image ${i + 1}`} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {img.isHeroFilter && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-transparent pointer-events-none" />
                </>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
