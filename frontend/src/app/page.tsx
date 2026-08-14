import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DualCTA } from "@/components/landing/DualCTA";
import { MasonryGallery } from "@/components/landing/MasonryGallery";
import { Testimonial } from "@/components/landing/Testimonial";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <DualCTA />
      <HowItWorks />
      <MasonryGallery />
      <Testimonial />
      <Footer />
    </div>
  );
}
