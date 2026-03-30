import React from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OnboardingStep4 = () => {
  const { formData, updateFormData, nextStep, prevStep, skipStep } =
    useOnboardingStore();

  const handleConnect = () => {
    // Mock connecting ORCID
    updateFormData({ orcidId: "0000-0002-1825-0097" });
    // In a real scenario, this would open a popup or redirect.
    // For now, we just mock the success.
    setTimeout(() => {
        nextStep();
    }, 500);
  };

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
        <button
          onClick={skipStep}
          className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors font-medium"
        >
          Skip
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-8">
        <h1 className="text-display-sm font-bold text-brand-teal-600 leading-tight">
          Connect ORCID
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          ORCID provides a persistent digital identifier that distinguishes you
          from every other researcher.
        </p>
      </div>

      {/* ORCID Button Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-brand-gray-50 rounded-[12px] border border-dashed border-brand-gray-100 mb-12">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <span className="text-brand-teal-600 font-bold">iD</span>
        </div>
        <Button
          onClick={handleConnect}
          className="bg-[#A6CE39] hover:bg-[#95b933] text-white rounded-full px-8 py-6 font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <img 
            src="https://orcid.org/sites/default/files/images/orcid_16x16.png" 
            alt="ORCID iD" 
            className="w-4 h-4 invert brightness-0"
          />
          Connect ORCID
        </Button>
        <p className="text-[12px] text-brand-gray-400 mt-4 text-center">
            You will be redirected to ORCID to authorize Science for Africa.
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col pt-8 border-t border-brand-gray-100">
        <Button
          onClick={nextStep}
          disabled={!formData.orcidId}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-50 disabled:text-white"
        >
          Confirm
        </Button>
        <p className="text-[14px] text-brand-gray-500 mt-4 text-center italic">
            You can also add this later in your profile settings.
        </p>
      </div>
    </div>
  );
};

export default OnboardingStep4;
