import Link from "next/link";
import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 font-serif text-2xl font-semibold text-zinc-900 mb-4">
              FoundMe
            </Link>
            <p className="text-zinc-500 max-w-sm">
              The smartest way to deliver event photos. AI-powered face recognition for instant, seamless galleries.
            </p>
          </div>
          
          <div className="flex gap-12 text-center md:text-left">
             <div>
                <h4 className="font-semibold text-zinc-900 mb-4">Product</h4>
                <ul className="space-y-3 text-sm text-zinc-500">
                   <li><Link href="/sign-up" className="hover:text-zinc-900 transition-colors">For Photographers</Link></li>
                   <li><Link href="/sign-up" className="hover:text-zinc-900 transition-colors">For Attendees</Link></li>
                   <li><Link href="/sign-in" className="hover:text-zinc-900 transition-colors">Sign In</Link></li>
                </ul>
             </div>
             <div>
                <h4 className="font-semibold text-zinc-900 mb-4">Legal</h4>
                <ul className="space-y-3 text-sm text-zinc-500">
                   <li><Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
                   <li><Link href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
                   <li><Link href="#" className="hover:text-zinc-900 transition-colors">Contact</Link></li>
                </ul>
             </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-zinc-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <div>© {new Date().getFullYear()} FoundMe. All rights reserved.</div>
          <div className="flex items-center gap-2">
            Built with <Camera className="h-4 w-4" /> for memories
          </div>
        </div>
      </div>
    </footer>
  );
}
