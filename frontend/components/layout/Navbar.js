import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 z-50 bg-white shadow-sm">
      {/* Top Banner - 34px */}
      <div className="h-[34px] bg-brand-gray-50 border-b border-gray-100 flex items-center">
        <div className="container mx-auto px-4 md:px-8 flex justify-end gap-6 text-[11px] font-medium text-brand-gray-600 uppercase tracking-wider">
          <Link href="/about" className="hover:text-primary-700 transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-primary-700 transition-colors">Contact</Link>
          <Link href="/help" className="hover:text-primary-700 transition-colors">Support</Link>
        </div>
      </div>

      {/* Main Nav - 80px */}
      <div className="h-[80px] flex items-center border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full py-4">
            <img 
              src="/logo-full.png" 
              alt="Science for Africa" 
              className="h-full object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-brand-gray-700 uppercase tracking-wide">
            <Link href="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <Link href="/community" className="hover:text-primary-600 transition-colors">Community</Link>
            <Link href="/programs" className="hover:text-primary-600 transition-colors">Programs</Link>
            <Link href="/members" className="hover:text-primary-600 transition-colors">Members</Link>
          </nav>

          {/* Search & Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-8 px-3 py-1.5 focus-within:border-primary-500 transition-all">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs ml-2 w-40 text-brand-gray-700"
              />
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-teal-50 flex items-center justify-center text-brand-teal-700 font-bold text-xs ring-2 ring-white">
              GP
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-brand-gray-700" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 py-4 absolute w-full transition-all">
          <nav className="flex flex-col container mx-auto px-4 gap-4 text-sm font-semibold text-brand-gray-700">
            <Link href="/" className="py-2 hover:text-primary-600">Dashboard</Link>
            <Link href="/community" className="py-2 hover:text-primary-600">Community</Link>
            <Link href="/programs" className="py-2 hover:text-primary-600">Programs</Link>
            <Link href="/members" className="py-2 hover:text-primary-600">Members</Link>
            <hr className="border-gray-100" />
            <Link href="/login" className="py-2 text-primary-600">Sign In</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
