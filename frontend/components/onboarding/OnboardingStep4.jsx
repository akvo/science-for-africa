import React from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "next-i18next";

const OnboardingStep4 = () => {
  const { t } = useTranslation("onboarding");
  const { formData, updateFormData, nextStep, prevStep, skipStep } =
    useOnboardingStore();

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-90 mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-24">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>{t("steps.back")}</span>
        </button>
        <button
          onClick={skipStep}
          className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium cursor-pointer"
        >
          {t("steps.skip")}
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          {t("step4.title")}
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          {t("step4.description")}
        </p>
      </div>

      {/* ORCID Input Section */}
      <div className="space-y-6 mb-12">
        <div className="space-y-2">
          <Label htmlFor="orcid-id" className="text-md font-medium text-black">
            {t("step4.orcid_label")}
          </Label>
          <Input
            id="orcid-id"
            placeholder={t("step4.orcid_placeholder")}
            value={formData.orcidId || ""}
            onChange={(e) => updateFormData({ orcidId: e.target.value })}
            className="h-11 px-3.5 py-2.5 border-brand-gray-100 rounded-8 text-md transition-all focus:ring-brand-teal-500"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col">
        <Button
          onClick={nextStep}
          disabled={!formData.orcidId}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-100 disabled:text-white"
        >
          {t("steps.confirm")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep4;
