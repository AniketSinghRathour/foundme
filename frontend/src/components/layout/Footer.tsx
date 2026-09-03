import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-900 py-10 md:py-14">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 pb-10 mb-8 border-b border-zinc-800/60">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
            <Link href="/" className="font-serif text-2xl font-semibold text-white tracking-tight">
              Facet
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left leading-relaxed md:ml-8 md:border-l md:border-zinc-800 md:pl-8">
              The smartest way to deliver event photos. AI-powered face recognition for instant, seamless galleries.
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <span className="text-xs md:text-sm">
            &copy; {new Date().getFullYear()} Facet. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
