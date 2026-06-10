import React from "react";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { updateUserProfile } from "@/lib/strapi";

const locales = [
  { code: "en", name: "English", label: "ENG" },
  { code: "pt", name: "Portuguese", label: "POR" },
  { code: "sw", name: "Swahili", label: "SWA" },
  { code: "fr", name: "French", label: "FRA" },
  { code: "ar", name: "Arabic", label: "ARA" },
];

const LocaleSwitcher = () => {
  const router = useRouter();
  const { locale: activeLocale, pathname, query, asPath } = router;
  const { isAuthenticated, updateUser } = useAuthStore();

  const handleLocaleChange = async (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });

    // Persist language preference to user profile if logged in
    if (isAuthenticated) {
      try {
        const response = await updateUserProfile({
          languagePreferences: newLocale,
        });
        if (response) updateUser(response);
      } catch (err) {
        // Silently fail — locale switch still works locally
      }
    }
  };

  const currentLocale =
    locales.find((l) => l.code === activeLocale) || locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 flex items-center gap-2 hover:bg-transparent text-brand-gray-600 font-medium text-sm group"
        >
          <Globe className="w-4 h-4 text-brand-gray-400 group-hover:text-brand-gray-600 transition-colors" />
          <span className="uppercase tracking-wide">{currentLocale.label}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-auto px-10 py-8 grid grid-cols-2 gap-x-8 gap-y-8 rounded-2xl border-brand-gray-100 shadow-xl shadow-brand-gray-200/40"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={`flex items-center cursor-pointer p-0 focus:bg-transparent hover:text-brand-teal-600 transition-colors ${
              activeLocale === loc.code
                ? "text-brand-teal-600 font-semibold"
                : "text-brand-gray-800 font-medium"
            }`}
          >
            <span className="text-base">{loc.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleSwitcher;
