import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { Search, ChevronUp, File, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Meta from "@/components/seo/Meta";
import { fetchAllResources, fetchResourcesPage } from "@/lib/strapi";
import { getFullFileUrl } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import ViewResourceDialog from "@/components/community/ViewResourceDialog";

const RESOURCE_TYPE_KEYS = [
  { key: "case-study", i18nKey: "resources.case_study" },
  { key: "report", i18nKey: "resources.report" },
  { key: "publication", i18nKey: "resources.publication" },
  { key: "practice-note", i18nKey: "resources.practice_note" },
];

const THEMATIC_AREA_KEYS = [
  { value: "Economy", i18nKey: "resources.area_economy" },
  { value: "Society", i18nKey: "resources.area_society" },
  { value: "Nature", i18nKey: "resources.area_nature" },
  { value: "Climate", i18nKey: "resources.area_climate" },
  { value: "Food", i18nKey: "resources.area_food" },
  { value: "Technology", i18nKey: "resources.area_technology" },
  { value: "Health", i18nKey: "resources.area_health" },
  { value: "Communication", i18nKey: "resources.area_communication" },
];

const REGION_KEYS = [
  { value: "Africa", i18nKey: "resources.region_africa" },
  { value: "Oceania", i18nKey: "resources.region_oceania" },
  { value: "Europe", i18nKey: "resources.region_europe" },
  { value: "Asia", i18nKey: "resources.region_asia" },
  { value: "Americas", i18nKey: "resources.region_americas" },
];

const TYPE_I18N_KEYS = {
  "case-study": "resources.case_study",
  report: "resources.report",
  publication: "resources.publication",
  "practice-note": "resources.practice_note",
};

/* ───────────────── Resource Row Card ───────────────── */

function ResourceRow({ resource, onView, onDownload, t }) {
  const fileUrl = getFullFileUrl(resource.file?.url);

  return (
    <div className="border-b border-r border-brand-gray-200 p-4">
      {/* Top row: icon + type/title + buttons */}
      <div className="flex items-center gap-3">
        {/* File icon */}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gray-100">
          <File className="size-6 text-primary-500" />
        </div>

        {/* Type + Title */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-brand-gray-500">
            {t(TYPE_I18N_KEYS[resource.resourceType] || resource.resourceType)}
          </span>
          <h3 className="text-sm font-semibold text-brand-gray-900 truncate">
            {resource.name}
          </h3>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onView?.(resource)}
            className="inline-flex h-9 items-center rounded-full border border-brand-gray-200 bg-white px-4 text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-50 transition-colors"
          >
            {t("resources.view")}
          </button>
          {fileUrl && (
            <button
              type="button"
              onClick={() => onDownload?.(resource, fileUrl)}
              className="inline-flex h-9 items-center rounded-full border border-brand-gray-200 bg-white px-4 text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-50 transition-colors"
            >
              {t("resources.download")}
            </button>
          )}
        </div>
      </div>

      {/* Tags row — aligned with text (offset by icon width) */}
      {resource.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
          {resource.topics.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-brand-gray-200 px-3 py-1 text-xs font-medium text-brand-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Filter Sidebar Components ───────────────── */

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-brand-gray-100 pb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2.5 text-sm font-medium text-brand-gray-700"
      >
        {title}
        <ChevronUp
          className={`size-4 text-brand-gray-400 transition-transform ${open ? "" : "rotate-180"}`}
        />
      </button>
      {open && <div className="flex flex-col gap-2.5 pb-1">{children}</div>}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-brand-gray-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-brand-gray-300 text-primary-600 focus:ring-primary-500"
      />
      {label}
    </label>
  );
}

/* ───────────────── Sort Dropdown ───────────────── */

function SortDropdown({ value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const options = [
    { key: "newest", label: t("resources.sort_newest") },
    { key: "oldest", label: t("resources.sort_oldest") },
    { key: "name", label: t("resources.sort_name") },
  ];
  const current = options.find((o) => o.key === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-teal-700 bg-white px-4 text-sm font-medium text-brand-teal-700 hover:bg-brand-teal-50"
      >
        {t("resources.sort_by")}
        <ChevronDown className="size-3.5 text-brand-teal-700" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-28 rounded-md border border-brand-gray-200 bg-white shadow-md py-1">
            {options.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-sm ${o.key === value ? "text-primary-600 font-medium" : "text-brand-gray-700"} hover:bg-brand-gray-50`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */

export default function ResourcesPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [resources, setResources] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewResource, setViewResource] = useState(null);

  const handleView = (resource) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setViewResource(resource);
  };

  const handleDownload = (resource, fileUrl) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = resource.file?.name || resource.name;
    a.click();
  };

  useEffect(() => {
    const locale = router.locale || "en";
    Promise.all([fetchAllResources(), fetchResourcesPage(locale)]).then(
      ([resRes, pageRes]) => {
        setResources(Array.isArray(resRes?.data) ? resRes.data : []);
        setPageData(pageRes?.data || null);
        setLoading(false);
      },
    );
  }, [router.locale]);

  const toggleFilter = (setter) => (key) => {
    setter((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const hasFilters =
    selectedTypes.length > 0 ||
    selectedAreas.length > 0 ||
    selectedRegions.length > 0;

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedAreas([]);
    setSelectedRegions([]);
  };

  const filtered = useMemo(() => {
    let result = resources;

    if (selectedTypes.length > 0) {
      result = result.filter((r) => selectedTypes.includes(r.resourceType));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.topics?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

    return result;
  }, [resources, selectedTypes, search, sortBy]);

  const heroTitle = pageData?.title || t("resources.hero_title_fallback");
  const heroDescription =
    pageData?.description || t("resources.hero_description_fallback");
  const heroBadge = pageData?.badge || t("resources.hero_badge_fallback");
  const heroImageUrl =
    pageData?.heroImage?.url || "/assets/images/landing/about.png";

  return (
    <>
      <Meta title={t("resources.title", { defaultValue: "Resources" })} />

      {/* Hero */}
      <section className="bg-brand-teal-900 text-center pt-10 pb-28 md:pb-36 rounded-b-[3rem]">
        <div className="container mx-auto px-4 max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-brand-teal-600 bg-white px-4 py-1.5 text-xs font-medium text-brand-teal-700 mb-5">
            {heroBadge}
          </span>
          <h1 className="text-display-sm md:text-display-md font-bold text-white leading-tight">
            {heroTitle}
          </h1>
          <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Banner Image — overlaps hero */}
      <div className="px-6 sm:px-10 lg:px-14 -mt-20 md:-mt-28 relative z-10">
        <div className="h-[280px] md:h-[400px] relative overflow-hidden rounded-2xl">
          <Image
            src={heroImageUrl}
            alt={heroTitle}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Sidebar Filters */}
          <aside className="w-full lg:w-[220px] flex-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-brand-gray-900">
                {t("resources.filters")}
              </h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-7 items-center rounded-full border border-brand-gray-200 px-3 text-xs font-medium text-brand-gray-600 hover:bg-brand-gray-50"
                >
                  {t("resources.reset")}
                </button>
              )}
            </div>

            <FilterSection title={t("resources.resource_type")}>
              {RESOURCE_TYPE_KEYS.map((rt) => (
                <CheckboxItem
                  key={rt.key}
                  label={t(rt.i18nKey)}
                  checked={selectedTypes.includes(rt.key)}
                  onChange={() => toggleFilter(setSelectedTypes)(rt.key)}
                />
              ))}
            </FilterSection>

            <FilterSection title={t("resources.thematic_area")}>
              {THEMATIC_AREA_KEYS.map((area) => (
                <CheckboxItem
                  key={area.value}
                  label={t(area.i18nKey)}
                  checked={selectedAreas.includes(area.value)}
                  onChange={() => toggleFilter(setSelectedAreas)(area.value)}
                />
              ))}
            </FilterSection>

            <FilterSection title={t("resources.region")}>
              {REGION_KEYS.map((region) => (
                <CheckboxItem
                  key={region.value}
                  label={t(region.i18nKey)}
                  checked={selectedRegions.includes(region.value)}
                  onChange={() => toggleFilter(setSelectedRegions)(region.value)}
                />
              ))}
            </FilterSection>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 border border-b-0 border-brand-gray-200 p-3">
              <span className="text-sm font-semibold text-brand-gray-900">
                {t("resources.resources_count", { count: filtered.length })}
              </span>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-gray-400" />
                  <input
                    type="text"
                    placeholder={t("resources.search_placeholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-[320px] rounded-full border border-brand-gray-200 bg-white pl-9 pr-3 text-sm text-brand-gray-700 placeholder:text-brand-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                  />
                </div>
                <SortDropdown value={sortBy} onChange={setSortBy} t={t} />
              </div>
            </div>

            {/* Resource List */}
            {loading ? (
              <div className="py-20 text-center text-sm text-brand-gray-500">
                {t("resources.loading")}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-sm text-brand-gray-500 rounded-xl border border-dashed border-brand-gray-200">
                {t("resources.no_resources_found")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-brand-gray-200">
                {filtered.map((resource) => (
                  <ResourceRow
                    key={resource.documentId || resource.id}
                    resource={resource}
                    onView={handleView}
                    onDownload={handleDownload}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewResourceDialog
        open={!!viewResource}
        onOpenChange={(open) => {
          if (!open) setViewResource(null);
        }}
        resource={viewResource}
      />
    </>
  );
}

ResourcesPage.noContainer = true;
ResourcesPage.showFooter = true;

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "community"])),
    },
  };
}
