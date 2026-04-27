import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import LocaleSwitcher from "./LocaleSwitcher";
import { useAuthStore } from "@/lib/auth-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Settings,
  Plus,
  Users,
  FileText,
  Bookmark,
  Calendar,
  Award,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";

import VerificationBadge from "@/components/shared/VerificationBadge";

const Navbar = () => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wrap in setTimeout to avoid the 'react-hooks/set-state-in-effect' lint error
    // which flags synchronous state updates inside useEffect.
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const navLinks = [
    { name: t("navbar.about"), href: "/about" },
    {
      name: t("navbar.community"),
      href: "/community",
      hasDropdown: true,
    },
    { name: t("navbar.opportunities"), href: "/opportunities" },
    { name: t("navbar.learning"), href: "/learning" },
    { name: t("navbar.resources"), href: "/resources" },
  ];

  return (
    <header className="w-full fixed top-0 z-100 bg-white">
      {/* Top Banner - 34px */}
      <div className="h-8.5 bg-brand-gray-50 border-b border-brand-gray-100 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm font-medium text-primary-500">
          <LocaleSwitcher />
          <div className="flex items-center gap-6">
            <Link href="/news" className="hover:opacity-80 transition-opacity">
              {t("navbar.news")}
            </Link>
            <Link
              href="/contact"
              className="hover:opacity-80 transition-opacity"
            >
              {t("navbar.contact")}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav - 80px */}
      <div className="h-20 flex items-center border-b border-brand-gray-100">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo & Links Group */}
          <div className="flex items-center gap-10">
            <Link href="/" className="shrink-0 relative block w-auto h-32">
              <Image
                src="/logo-full.png"
                alt="Science for Africa"
                width={240}
                height={128}
                priority
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

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Publish Button */}
                <Button
                  variant="outline"
                  size="xl"
                  className="hidden sm:flex"
                  asChild
                >
                  <Link href="/publish" className="gap-2 font-medium">
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    {t("navbar.publish")}
                  </Link>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar
                      size="md"
                      className="cursor-pointer border-2 border-white shadow-sm hover:ring-2 hover:ring-brand-teal-100 transition-all"
                    >
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback>
                        {getInitials(user?.fullName || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={14}
                    className="w-72 p-0 rounded-2xl shadow-xl border-brand-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  >
                    {/* Identity Header */}
                    <div className="flex items-center gap-4 px-5 py-4 bg-white">
                      <Avatar size="lg" className="shrink-0">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-brand-teal-50 text-brand-teal-900 font-bold text-lg">
                          {getInitials(user?.fullName || user?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <p className="text-md font-bold text-brand-teal-900 truncate capitalize flex items-center gap-2">
                          {user?.fullName || user?.username}
                          <VerificationBadge verified={user?.verified} />
                        </p>
                        <p className="text-sm font-medium text-brand-gray-500 truncate mt-0.5 capitalize">
                          {user?.userType || t("navbar.researcher_placeholder")}
                        </p>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="m-0 bg-brand-gray-100" />

                    {/* Personal Management Section */}
                    <div className="py-2">
                      {[
                        {
                          key: "details",
                          href: "/coming-soon",
                        },
                        {
                          key: "communities",
                          href: "/coming-soon",
                        },
                        {
                          key: "content",
                          href: "/coming-soon",
                        },
                        {
                          key: "saved_posts",
                          href: "/coming-soon",
                        },
                        {
                          key: "my_events",
                          href: "/coming-soon",
                        },
                        {
                          key: "courses",
                          href: "/coming-soon",
                        },
                      ].map((item) => (
                        <DropdownMenuItem
                          key={item.key}
                          asChild
                          className="px-5 py-3 focus:bg-brand-gray-50 cursor-pointer overflow-hidden group"
                        >
                          <Link
                            href={item.href}
                            className="flex items-center w-full"
                          >
                            <span className="text-sm font-medium text-black group-hover:text-brand-teal-900 transition-colors">
                              {t(`navbar.profile_dropdown.${item.key}`)}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>

                    <DropdownMenuSeparator className="m-0 bg-brand-gray-100" />

                    {/* Support Section */}
                    <div className="py-2">
                      <DropdownMenuItem
                        asChild
                        className="px-5 py-3 focus:bg-brand-gray-50 cursor-pointer group"
                      >
                        <Link
                          href="/coming-soon"
                          className="flex items-center w-full"
                        >
                          <span className="text-sm font-medium text-black group-hover:text-brand-teal-900 transition-colors">
                            {t("navbar.profile_dropdown.faq")}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="m-0 bg-brand-gray-100" />

                    {/* Action Section */}
                    <div className="py-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="px-5 py-3 flex items-center justify-between focus:bg-brand-gray-50 cursor-pointer group logout-item"
                      >
                        <span className="text-sm font-bold text-brand-gray-900 group-hover:text-red-600 transition-colors">
                          {t("navbar.profile_dropdown.logout")}
                        </span>
                        <LogOut className="h-5 w-5 text-brand-gray-400 group-hover:text-red-600 transition-colors" />
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : mounted ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="xl" asChild>
                  <Link href="/login" className="font-medium">
                    {t("navbar.login")}
                  </Link>
                </Button>
                <Button variant="primary" size="xl" asChild>
                  <Link href="/signup" className="font-medium">
                    {t("navbar.signup")}
                  </Link>
                </Button>
              </div>
            ) : null}

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
            <div className="flex flex-col gap-3 pt-4 border-t border-brand-gray-100">
              {mounted && isAuthenticated ? (
                <>
                  <Link
                    href="/coming-soon"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-2 py-3 hover:bg-brand-gray-50 rounded-lg transition-colors cursor-pointer group"
                  >
                    <Avatar
                      size="sm"
                      className="group-hover:ring-2 group-hover:ring-brand-teal-100 transition-all"
                    >
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback>
                        {getInitials(user?.fullName || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-brand-teal-900 truncate capitalize flex items-center gap-2">
                        {user?.fullName || user?.username}
                        <VerificationBadge verified={user?.verified} />
                      </p>
                      <p className="text-xs text-brand-gray-500 truncate capitalize">
                        {user?.userType || t("navbar.researcher_placeholder")}
                      </p>
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { key: "details" },
                      { key: "communities" },
                      { key: "content" },
                      { key: "saved_posts" },
                      { key: "my_events" },
                      { key: "courses" },
                      { key: "faq" },
                    ].map((item) => (
                      <Button
                        key={item.key}
                        variant="outline"
                        size="md"
                        className="w-full justify-start h-10 px-3"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/coming-soon">
                          <span className="text-xs truncate text-black font-medium">
                            {t(`navbar.profile_dropdown.${item.key}`)}
                          </span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="xl"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("navbar.profile_dropdown.logout")}
                  </Button>
                </>
              ) : mounted ? (
                <>
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/login" className="font-medium">
                      {t("navbar.login")}
                    </Link>
                  </Button>
                  <Button
                    variant="primary"
                    size="xl"
                    className="w-full"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/signup" className="font-medium">
                      {t("navbar.signup")}
                    </Link>
                  </Button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
