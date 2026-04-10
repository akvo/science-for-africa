import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import LocaleSwitcher from "./LocaleSwitcher";

const carouselData = [
  {
    image: "/assets/images/auth/carousel-1.png",
    title: "Advancing Science for Africa's Future.",
    description:
      "Join the community of scientists, researchers, and innovators building a sustainable scientific ecosystem across the continent.",
  },
  {
    image: "/assets/images/auth/carousel-2.png",
    title: "Collaborative Research Excellence.",
    description:
      "Connect with leading institutions and peers to drive innovation and scientific breakthroughs that impact lives.",
  },
  {
    image: "/assets/images/auth/carousel-3.png",
    title: "Empowering the Next Generation.",
    description:
      "Access resources, mentorship, and opportunities designed to foster growth and leadership in the scientific community.",
  },
];

const AuthLayout = ({ children, activeStep }) => {
  const [api, setApi] = useState();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrentSlide(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  // Synchronize carousel position with currentSlide state

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-brand-gray-900 antialiased">
      {/* Left Column: Form Section */}
      <div className="w-full md:w-[44%] flex flex-col h-screen overflow-y-auto">
        {/* Header Navigation */}
        <div className="flex items-start p-8 lg:p-12">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <img
              src="/logo-full.png"
              alt="Science for Africa"
              className="h-32 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Container / Content Area */}
        <div className="grow flex items-center justify-center px-6 md:px-8 lg:px-12 py-10 md:py-16">
          <div className="w-full max-w-90">{children}</div>
        </div>

        {/* Footer Signup */}
        <div className="h-20 md:h-24 flex items-end justify-between px-6 md:px-8 lg:px-12 pb-6 md:pb-8">
          <p className="text-xs md:text-sm text-brand-gray-500 font-medium">
            © Science for Africa 2026
          </p>
          <LocaleSwitcher />
        </div>
      </div>

      {/* Right Column: Visual Section */}
      <div className="hidden md:flex md:w-[56%] p-2 relative overflow-hidden h-screen bg-white">
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xs border border-brand-gray-100">
          <Carousel
            setApi={setApi}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full h-full"
            opts={{
              loop: true,
              align: "start",
              containScroll: "trimSnaps",
            }}
          >
            <CarouselContent
              wrapperClassName="w-full h-full"
              className="h-full ml-0"
            >
              {carouselData.map((slide, index) => (
                <CarouselItem
                  key={index}
                  className="relative basis-full min-w-full h-full pl-0 overflow-hidden"
                >
                  <div className="relative w-full h-full">
                    {/* Main Background Image */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-6000 scale-105"
                    />

                    {/* Subtle Overlay instead of broken noisy SVG */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-black"></div>

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Text Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center text-white space-y-4 pb-24">
                      <h2 className="text-xl md:text-2xl font-bold leading-tight drop-shadow-lg max-w-md mx-auto">
                        {slide.title}
                      </h2>
                      <p className="text-sm text-white/90 leading-relaxed font-medium max-w-lg mx-auto drop-shadow-md">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Stepper Dots (Overlay) - Integrated with Carousel API */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-3 items-center">
              {carouselData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    currentSlide === index
                      ? "w-8 bg-brand-teal-500 shadow-[0_0_12px_rgba(0,128,115,0.7)]"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
