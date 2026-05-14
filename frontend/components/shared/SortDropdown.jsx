import { useTranslation } from "next-i18next";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const defaultOptions = [
  {
    value: "newest",
    labelKey: "community.sort_newest",
    defaultLabel: "Newest",
  },
  {
    value: "oldest",
    labelKey: "community.sort_oldest",
    defaultLabel: "Oldest",
  },
];

export default function SortDropdown({
  sortOrder,
  onChange,
  options = defaultOptions,
}) {
  const { t } = useTranslation("common");

  const selectedOption = options.find((opt) => opt.value === sortOrder);
  const triggerLabel = selectedOption
    ? t(selectedOption.labelKey, { defaultValue: selectedOption.defaultLabel })
    : t("community.sort_by", { defaultValue: "Sort by" });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md" className="gap-2">
          <ChevronDown className="size-4" />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => onChange(opt.value)}>
            {t(opt.labelKey, { defaultValue: opt.defaultLabel })}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
