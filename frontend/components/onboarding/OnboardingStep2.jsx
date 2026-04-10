import React, { useEffect, useState } from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

import { fetchFromStrapi, updateUserProfile } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const OnboardingStep2 = () => {
  const { t } = useTranslation("onboarding");
  const router = useRouter();
  const { locale } = router;
  const {
    formData,
    toggleInterest,
    nextStep,
    prevStep,
    skipStep,
    userType,
    resetStore,
  } = useOnboardingStore();
  const { jwt, updateUser } = useAuthStore();

  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInterests = async () => {
      setLoading(true);
      try {
        const response = await fetchFromStrapi(`/interests?locale=${locale}`);
        if (response?.data) {
          // Group by category
          const grouped = response.data.reduce((acc, item) => {
            const { category, name } = item;
            if (!acc[category]) acc[category] = [];
            acc[category].push(name);
            return acc;
          }, {});
          setCategories(grouped);
        }
      } catch (error) {
        console.error("Failed to load interests:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInterests();
  }, [locale]);

  const isSelected = (interest) => formData.interests.includes(interest);
  const isLimitReached = formData.interests.length >= 5;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateUserProfile(
        {
          ...formData,
          userType,
          onboardingComplete: true,
        },
        jwt,
      );

      if (result && !result.error) {
        updateUser({ onboardingComplete: true });
        resetStore();
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInstitution = userType === "institution";

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
        {!isInstitution && (
          <button
            onClick={skipStep}
            className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium"
          >
            {t("steps.skip")}
          </button>
        )}
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          {t("step2.title")}
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          {t("step2.description")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-75 max-h-110 scrollbar-thin scrollbar-thumb-brand-gray-200 scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-brand-teal-600" />
            <p className="text-sm text-brand-gray-500">
              {t("step2.loading_interests", {
                defaultValue: "Loading interests...",
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-2 pb-12">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-bold text-black px-1">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => {
                    const selected = isSelected(item);
                    const disabled = !selected && isLimitReached;

                    return (
                      <Badge
                        key={item}
                        role="button"
                        variant={selected ? "default" : "outline"}
                        onClick={() => toggleInterest(item)}
                        className={cn(
                          "px-3.5 py-4 text-sm font-normal rounded-full transition-all duration-300 cursor-pointer shadow-none",
                          selected
                            ? "bg-brand-teal-600 text-white border-brand-teal-600 hover:bg-brand-teal-700 active:scale-95 transition-transform"
                            : "bg-white text-brand-gray-700 border-brand-gray-200 hover:bg-brand-teal-50 hover:border-brand-teal-200 active:scale-95",
                          disabled &&
                            "opacity-30 cursor-not-allowed pointer-events-none",
                        )}
                      >
                        {item}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={isInstitution ? handleComplete : nextStep}
          disabled={formData.interests.length === 0 || isSubmitting}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-100 disabled:text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("step5.finishing")}
            </>
          ) : isInstitution ? (
            t("step5.complete_button")
          ) : (
            t("steps.confirm")
          )}
        </Button>
      </div>

      {isLimitReached && (
        <p className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-brand-teal-900 text-white text-xs rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {t("step2.limit_reached", {
            defaultValue: "Maximum 5 interests allowed",
          })}
        </p>
      )}
    </div>
  );
};

export default OnboardingStep2;
