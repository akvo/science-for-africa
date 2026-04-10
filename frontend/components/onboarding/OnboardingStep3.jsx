import React, { useState, useRef } from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { fetchFromStrapi } from "@/lib/strapi";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { EDUCATION_LEVEL_OPTIONS } from "@/lib/onboarding-constants";

const OnboardingStep3 = () => {
  const { t } = useTranslation("onboarding");
  const { formData, updateFormData, nextStep, prevStep, skipStep } =
    useOnboardingStore();

  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    formData.educationInstitution?.name || "",
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchTimeoutRef = useRef(null);

  const handleSearch = async (val) => {
    setSearchTerm(val);
    updateFormData({ educationInstitution: { id: null, name: val } });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.length > 2) {
      setLoading(true);
      setShowDropdown(true);

      searchTimeoutRef.current = setTimeout(async () => {
        const encodedVal = encodeURIComponent(val);
        const response = await fetchFromStrapi(
          `/institutions?filters[name][$containsi]=${encodedVal}`,
        );
        if (response?.data) {
          setInstitutions(
            response.data.map((item) => ({ id: item.id, name: item.name })),
          );
        }
        setLoading(false);
      }, 300);
    } else {
      setShowDropdown(false);
      setLoading(false);
    }
  };

  const handleSelect = (inst) => {
    setSearchTerm(inst.name);
    updateFormData({ educationInstitution: inst });
    setShowDropdown(false);
  };

  const handleConfirm = () => {
    nextStep();
  };

  const isFormValid =
    formData.educationLevel &&
    formData.educationInstitution?.name?.trim() !== "";

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-90 mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-24">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>{t("steps.back")}</span>
        </button>
        <button
          onClick={skipStep}
          className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium"
        >
          {t("steps.skip")}
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          {t("step3.title")}
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          {t("step3.description")}
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 mb-10">
        {/* Education Level */}
        <div className="space-y-2">
          <label className="text-md font-medium text-black">
            {t("step3.level_label")}
          </label>
          <Select
            value={formData.educationLevel}
            onValueChange={(val) => updateFormData({ educationLevel: val })}
          >
            <SelectTrigger className="w-full h-11 px-3.5 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500">
              <SelectValue placeholder={t("step3.level_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVEL_OPTIONS.map((level) => (
                <SelectItem key={level} value={level} className="text-md">
                  {t(`education_levels.${level}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Institution Name */}
        <div className="space-y-2 relative">
          <label className="text-md font-medium text-black">
            {t("step3.institution_label")}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <Input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
              placeholder={t("step3.institution_placeholder")}
              className="w-full h-11 pl-10 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-teal-600" />
              </div>
            )}
          </div>

          {showDropdown && institutions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-brand-gray-100 rounded-8 shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
              {institutions.map((inst, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(inst)}
                  className="w-full text-left px-4 py-3 hover:bg-brand-teal-50 transition-colors text-md text-brand-gray-900 border-b last:border-0 border-brand-gray-50"
                >
                  {inst.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col">
        <Button
          onClick={handleConfirm}
          disabled={!isFormValid}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-100 disabled:text-white"
        >
          {t("steps.confirm")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep3;
