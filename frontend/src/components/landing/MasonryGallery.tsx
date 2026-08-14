import Image from "next/image";

export function MasonryGallery() {
  const images = [
    { src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/3]" },
    { src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
    { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800", aspect: "aspect-square" },
    { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/5]" },
    { src: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[16/9]" },
    { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-4">Every kind of moment.</h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            From large-scale festivals and corporate conferences to intimate weddings. 
            If you were there, we have the photo.
          </p>
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
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
