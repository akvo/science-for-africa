import React, { useState, useRef } from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import {
  fetchFromStrapi,
  fetchLocalized,
  updateUserProfile,
} from "@/lib/strapi";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const OnboardingStep5 = () => {
  const { t } = useTranslation("onboarding");
  const router = useRouter();
  const { locale } = router;
  const { formData, updateFormData, prevStep, userType, resetStore } =
    useOnboardingStore();
  const { jwt, updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    formData.affiliationInstitution?.name || "",
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchTimeoutRef = useRef(null);

  const handleSearch = async (val) => {
    setSearchTerm(val);
    updateFormData({ affiliationInstitution: { id: null, name: val } });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.length > 2) {
      setLoading(true);
      setShowDropdown(true);

      searchTimeoutRef.current = setTimeout(async () => {
        const encodedVal = encodeURIComponent(val);
        const response = await fetchLocalized(
          `/institutions?filters[name][$containsi]=${encodedVal}`,
          locale,
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
    updateFormData({ affiliationInstitution: inst });
    setShowDropdown(false);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Sync with Strapi
      const result = await updateUserProfile(
        {
          ...formData,
          userType,
          onboardingComplete: true,
        },
        jwt,
      );

      if (result && !result.error) {
        // Update local auth store with full user data
        updateUser(result);

        // Purge professional onboarding data from sessionStorage
        resetStore();

        // Redirect to dashboard
        router.push("/");
      } else {
        console.error("Failed to update profile:", result.error);
        // Error handling could go here
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.affiliationInstitution?.name?.trim() !== "";

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
        {/* No skip on the final step, usually */}
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          {t("step5.title")}
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          {t("step5.description")}
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 mb-12">
        <div className="space-y-2 relative">
          <label className="text-md font-medium text-black">
            {t("step5.search_label")}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <Input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
              placeholder={t("step5.search_placeholder")}
              className="w-full h-11 pl-10 pr-10 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-teal-600" />
              </div>
            )}
          </div>

          {showDropdown && institutions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-brand-gray-100 rounded-8 shadow-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
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

          {showDropdown &&
            !loading &&
            institutions.length === 0 &&
            searchTerm.length > 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-brand-gray-100 rounded-8 shadow-xl p-4 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-brand-gray-500">
                  {t("step1.no_institutions_found")}
                </p>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="mt-2 text-sm font-medium text-brand-teal-600 hover:underline"
                >
                  {t("step1.dismiss")}
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col">
        <Button
          onClick={handleComplete}
          disabled={!isFormValid || isSubmitting}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-50 disabled:text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("step5.finishing")}
            </>
          ) : (
            t("step5.complete_button")
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep5;
