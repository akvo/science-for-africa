import React from 'react';
import Link from 'next/link';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Column: Form Section */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col p-8 md:p-12 lg:p-20 relative">
        {/* Branding */}
        <div className="mb-12 md:mb-20">
          <Link href="/">
            <img 
              src="/logo-full.png" 
              alt="Science for Africa" 
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-12 text-sm text-brand-gray-500">
          Need help? <Link href="/contact" className="text-primary-600 font-medium hover:underline">Contact Support</Link>
        </div>
      </div>

      {/* Right Column: Visual Section */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-brand-primary p-12 lg:p-20 relative overflow-hidden items-center justify-center">
        {/* Abstract Background pattern / Image placeholder */}
        <div className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center brightness-75 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-brand-teal-900/60"></div>
        
        <div className="relative z-10 max-w-lg text-white">
          <h2 className="text-display-lg font-bold mb-6">
            Advancing Science for Africa's Future.
          </h2>
          <p className="text-xl text-primary-50/90 leading-relaxed font-medium">
            Join the community of scientists, researchers, and innovators building a sustainable scientific ecosystem across the continent.
          </p>
          
          <div className="mt-12 flex gap-4 items-center">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-12 rounded-full border-2 border-primary-800 bg-primary-700 flex items-center justify-center text-xs font-bold ring-2 ring-primary-900/50">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-primary-100 font-medium">
              Join 2,500+ members today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
