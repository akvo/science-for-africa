import React, { useState } from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { getOrcidAuthorizeUrl } from "@/lib/strapi";

const OnboardingStep4 = () => {
  const { t } = useTranslation(["onboarding", "common"]);
  const { formData, nextStep, prevStep, skipStep } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const isVerified = formData.orcidVerified === true;

  const handleValidateOrcid = async () => {
    setLoading(true);
    const result = await getOrcidAuthorizeUrl("onboarding");
    if (result?.data?.authorizeUrl) {
      window.location.href = result.data.authorizeUrl;
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-90 mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-24">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>{t("onboarding:steps.back")}</span>
        </button>
        <button
          onClick={skipStep}
          className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium cursor-pointer"
        >
          {t("onboarding:steps.skip")}
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          {t("onboarding:step4.title")}
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          {t("onboarding:step4.description")}
        </p>
      </div>

      {/* ORCID Validation Section */}
      <div className="space-y-6 mb-12">
        {isVerified ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                ORCID Validated
              </p>
              {formData.orcidId && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  {formData.orcidId}
                </p>
              )}
            </div>
          </div>
        ) : (
          <Button
            onClick={handleValidateOrcid}
            disabled={loading}
            variant="outline"
            className="w-full h-12 rounded-full text-md font-medium border-brand-gray-200"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {t("common:verification.verifying")}
              </>
            ) : (
              t("common:verification.verify_orcid")
            )}
          </Button>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col">
        <Button
          onClick={nextStep}
          disabled={!isVerified}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-100 disabled:text-white"
        >
          {t("onboarding:steps.confirm")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep4;
