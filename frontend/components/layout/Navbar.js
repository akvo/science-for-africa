import React, { useState } from "react";
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
import { User, LogOut, Settings, Plus } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

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

            {isAuthenticated ? (
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
                  <DropdownMenuContent align="end" className="mt-2">
                    <div className="px-2 py-3">
                      <p className="text-sm font-bold text-brand-teal-900 truncate">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-xs text-brand-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("navbar.profile")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center w-full"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t("navbar.settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("navbar.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
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
            <div className="flex flex-col gap-3 pt-4 border-t border-brand-gray-100">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Avatar size="sm">
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback>
                        {getInitials(user?.fullName || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-brand-teal-900 truncate">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-xs text-brand-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      {t("navbar.profile")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t("navbar.settings")}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="xl"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("navbar.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full"
                    asChild
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
                  >
                    <Link href="/signup" className="font-medium">
                      {t("navbar.signup")}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
