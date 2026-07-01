import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { Search, ChevronUp, FileText, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Meta from "@/components/seo/Meta";
import { fetchAllResources, fetchResourcesPage } from "@/lib/strapi";
import { getFullFileUrl } from "@/lib/utils";

const RESOURCE_TYPES = [
  { key: "case-study", label: "Case study" },
  { key: "report", label: "Report" },
  { key: "publication", label: "Publication" },
  { key: "practice-note", label: "Report" },
  { key: "case-studie", label: "Case studie" },
];

const THEMATIC_AREAS = [
  "Economy",
  "Society",
  "Nature",
  "Climate",
  "Food",
  "Technology",
  "Health",
  "Communication",
];

const REGIONS = ["Africa", "Oceania", "Europe", "Asia", "Americas"];

const TYPE_LABELS = {
  "case-study": "Case study",
  "case-studie": "Case studie",
  report: "Report",
  publication: "Publication",
  "practice-note": "Report",
};

/* ───────────────── Resource Row Card ───────────────── */

function ResourceRow({ resource }) {
  const fileUrl = getFullFileUrl(resource.file?.url);

  return (
    <div className="border-b border-r border-brand-gray-200 p-4">
      {/* Top row: icon + type/title + buttons */}
      <div className="flex items-center gap-3">
        {/* File icon */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E6EEEE] text-brand-teal-600">
          <FileText className="size-5" />
        </div>

        {/* Type + Title */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-brand-gray-500">
            {TYPE_LABELS[resource.resourceType] || resource.resourceType}
          </span>
          <h3 className="text-sm font-semibold text-brand-gray-900 truncate">
            {resource.name}
          </h3>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {fileUrl && (
            <>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-full border border-brand-gray-200 bg-white px-4 text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-50 transition-colors"
              >
                View
              </a>
              <a
                href={fileUrl}
                download
                className="inline-flex h-9 items-center rounded-full border border-brand-gray-200 bg-white px-4 text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-50 transition-colors"
              >
                Download
              </a>
            </>
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

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const options = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "name", label: "Name" },
  ];
  const current = options.find((o) => o.key === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-teal-700 bg-white px-4 text-sm font-medium text-brand-teal-700 hover:bg-brand-teal-50"
      >
        Sort by
        <ChevronDown className="size-3.5 text-brand-teal-700" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg border border-brand-gray-100 bg-white shadow-lg py-1">
            {options.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm ${o.key === value ? "text-primary-600 font-medium" : "text-brand-gray-700"} hover:bg-brand-gray-50`}
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
  const [resources, setResources] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    Promise.all([fetchAllResources(), fetchResourcesPage()]).then(
      ([resRes, pageRes]) => {
        setResources(Array.isArray(resRes?.data) ? resRes.data : []);
        setPageData(pageRes?.data || null);
        setLoading(false);
      },
    );
  }, []);

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

  const heroTitle = pageData?.title || "Discover Our Valuable Resources";
  const heroDescription =
    pageData?.description ||
    "Discover a variety of resources, from insightful case studies to comprehensive reports, that will enhance your understanding and exploration of the subject.";
  const heroBadge = pageData?.badge || "Explore Resources";
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
                Filters
              </h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-7 items-center rounded-full border border-brand-gray-200 px-3 text-xs font-medium text-brand-gray-600 hover:bg-brand-gray-50"
                >
                  Reset
                </button>
              )}
            </div>

            <FilterSection title="Resouse type">
              {RESOURCE_TYPES.map((rt) => (
                <CheckboxItem
                  key={rt.key}
                  label={rt.label}
                  checked={selectedTypes.includes(rt.key)}
                  onChange={() => toggleFilter(setSelectedTypes)(rt.key)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Thematic area">
              {THEMATIC_AREAS.map((area) => (
                <CheckboxItem
                  key={area}
                  label={area}
                  checked={selectedAreas.includes(area)}
                  onChange={() => toggleFilter(setSelectedAreas)(area)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Region">
              {REGIONS.map((region) => (
                <CheckboxItem
                  key={region}
                  label={region}
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleFilter(setSelectedRegions)(region)}
                />
              ))}
            </FilterSection>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 border border-b-0 border-brand-gray-200 p-3">
              <span className="text-sm font-semibold text-brand-gray-900">
                {filtered.length} resources
              </span>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-[320px] rounded-full border border-brand-gray-200 bg-white pl-9 pr-3 text-sm text-brand-gray-700 placeholder:text-brand-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                  />
                </div>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {/* Resource List */}
            {loading ? (
              <div className="py-20 text-center text-sm text-brand-gray-500">
                Loading resources...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-sm text-brand-gray-500 rounded-xl border border-dashed border-brand-gray-200">
                No resources found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-brand-gray-200">
                {filtered.map((resource) => (
                  <ResourceRow
                    key={resource.documentId || resource.id}
                    resource={resource}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

ResourcesPage.noContainer = true;
ResourcesPage.showFooter = true;

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
