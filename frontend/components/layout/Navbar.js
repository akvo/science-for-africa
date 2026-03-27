import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const Navbar = ({ isLoggedIn = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Community", href: "/community", hasDropdown: true },
    { name: "Opportunities", href: "/opportunities" },
    { name: "Learning", href: "/learning" },
    { name: "Resources", href: "/resources" },
  ];

  return (
    <header className="w-full fixed top-0 z-100 bg-white">
      {/* Top Banner - 34px */}
      <div className="h-8.5 bg-brand-gray-50 border-b border-brand-gray-100 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm font-medium text-primary-500">
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>ENG</span>
            <svg
              className="w-3 h-3 ml-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/news" className="hover:opacity-80 transition-opacity">
              News and insights
            </Link>
            <Link
              href="/contact"
              className="hover:opacity-80 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav - 80px */}
      <div className="h-20 flex items-center border-b border-brand-gray-100">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo & Links Group */}
          <div className="flex items-center gap-10">
            <Link href="/" className="shrink-0">
              <img
                src="/logo-full.png"
                alt="Science for Africa"
                className="h-32 w-auto"
              />
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden xl:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-1 text-base font-medium text-brand-gray-900 hover:text-primary-500 transition-colors"
                >
                  {link.name}
                  {link.hasDropdown && (
                    <svg
                      className="w-4 h-4 text-brand-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <Button variant="outline" size="icon-xl" className="rounded-full">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* Publish Button */}
                <Button
                  variant="outline"
                  size="xl"
                  className="hidden sm:flex"
                  asChild
                >
                  <Link href="/publish" className="gap-2 font-medium">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Publish
                  </Link>
                </Button>
                {/* User Avatar */}
                <div className="h-10 w-10 rounded-full bg-brand-teal-50 flex items-center justify-center text-brand-teal-700 font-bold text-sm border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-brand-teal-100 transition-all">
                  OR
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="xl" asChild>
                  <Link href="/login" className="font-medium">
                    Login
                  </Link>
                </Button>
                <Button variant="primary" size="xl" asChild>
                  <Link href="/signup" className="font-medium">
                    Sign up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="xl:hidden p-2 text-brand-gray-900"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-white border-b border-brand-gray-100 py-6 absolute w-full shadow-xl">
          <nav className="flex flex-col max-w-7xl mx-auto px-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-brand-gray-900 py-2 border-b border-brand-gray-50"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="outline" size="xl" className="w-full" asChild>
                <Link href="/login" className="font-medium">
                  Login
                </Link>
              </Button>
              <Button variant="primary" size="xl" className="w-full" asChild>
                <Link href="/signup" className="font-medium">
                  Sign up
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
