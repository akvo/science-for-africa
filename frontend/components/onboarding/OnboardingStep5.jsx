import React, { useState } from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { updateUserProfile } from "@/lib/strapi";
import { useRouter } from "next/router";

const OnboardingStep5 = () => {
  const router = useRouter();
  const { formData, updateFormData, prevStep, userType } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Sync with Strapi
      await updateUserProfile({
        ...formData,
        onboardingComplete: true,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // In a real app, show a toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.affiliationInstitution?.trim() !== "";

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-90 mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        {/* No skip on the final step, usually */}
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-8">
        <h1 className="text-display-sm font-bold text-brand-teal-600 leading-tight">
          Institutional affiliation
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          We'll suggest research partners and funders based on your
          institutional affiliation.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 mb-12">
        <div className="space-y-2">
          <label className="text-md font-medium text-black">
            Name of institution
          </label>
          <Input
            value={formData.affiliationInstitution}
            onChange={(e) =>
              updateFormData({ affiliationInstitution: e.target.value })
            }
            placeholder="Type your primary institution"
            className="w-full h-11 px-3.5 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col pt-8 border-t border-brand-gray-100">
        <Button
          onClick={handleComplete}
          disabled={!isFormValid || isSubmitting}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-50 disabled:text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finishing...
            </>
          ) : (
            "Complete Onboarding"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep5;
