import React, { useState, useEffect } from "react";
import Link from "next/link";

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
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Use activeStep if provided, otherwise use currentSlide for the stepper dots
  const displayStep = activeStep !== undefined ? activeStep - 1 : currentSlide;

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
          <div className="flex items-center gap-1.5 cursor-pointer group transition-all duration-200">
            <span className="text-xs md:text-sm font-bold text-brand-gray-500 group-hover:text-brand-gray-900 transition-colors uppercase tracking-wider">
              ENG
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-gray-400 group-hover:text-brand-gray-900 transition-colors"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Section */}
      <div className="hidden md:flex md:w-[56%] relative p-3 overflow-hidden">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 bg-brand-gray-50">
          {carouselData.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Main Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-6000 ${
                  index === currentSlide ? "scale-105" : "scale-100"
                }`}
              />

              {/* Noise Overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Text Area */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center text-white space-y-4">
                <h2 className="text-xl md:text-2xl font-bold leading-tight drop-shadow-lg max-w-md mx-auto">
                  {slide.title}
                </h2>
                <p className="text-sm text-white/90 leading-relaxed font-medium max-w-lg mx-auto drop-shadow-md">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}

          {/* Stepper Dots (Overlay) */}
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3 items-center">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  displayStep === index
                    ? "w-8 bg-brand-teal-500 shadow-[0_0_12px_rgba(0,128,115,0.7)]"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
