import React from "react";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const locales = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const LocaleSwitcher = () => {
  const router = useRouter();
  const { locale: activeLocale, pathname, query, asPath } = router;

  const handleLocaleChange = (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const currentLocale =
    locales.find((l) => l.code === activeLocale) || locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 flex items-center gap-1.5 hover:bg-transparent text-primary-500 font-medium text-sm"
        >
          <span className="text-base leading-none">{currentLocale.flag}</span>
          <span>{currentLocale.code.toUpperCase()}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" strokeWidth={2.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit min-w-[110px] p-1.5">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              activeLocale === loc.code ? "bg-brand-gray-50 font-semibold" : ""
            }`}
          >
            <span className="text-base leading-none">{loc.flag}</span>
            <span className="uppercase text-[11px] font-bold text-brand-teal-600 bg-brand-teal-50 px-1 rounded-sm leading-none flex items-center h-4">
              {loc.code}
            </span>
            <span className="ml-1 text-sm text-brand-gray-700">{loc.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleSwitcher;
