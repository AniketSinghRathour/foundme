import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MasonryGallery } from "@/components/landing/MasonryGallery";
import { Testimonial } from "@/components/landing/Testimonial";
import { GuestExperience } from "@/components/landing/GuestExperience";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <MasonryGallery />
      <Testimonial />
      <GuestExperience />
      <Footer />
    </div>
  );
}
