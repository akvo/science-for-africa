import React from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const INTEREST_CATEGORIES = {
  Popular: [
    "Bioinformatics",
    "Genetics",
    "Virology",
    "Immunology",
    "Ecology",
    "Epidemiology",
    "Public Health",
    "Climate Change",
  ],
  Education: [
    "Curriculum Design",
    "STEM Outreach",
    "University Management",
    "Teacher Training",
  ],
  "Clinical & Medical": [
    "Clinical Trials",
    "Diagnostics",
    "Pharmacology",
    "Neuroscience",
    "Infectious Diseases",
  ],
  "Environmental & Earth": [
    "Sustainability",
    "Geophysics",
    "Hydrology",
    "Renewable Energy",
  ],
  "Socio-Economic": [
    "Health Economics",
    "Policy Analysis",
    "Social Informatics",
    "Gender Studies",
  ],
};

const OnboardingStep2 = () => {
  const { formData, toggleInterest, nextStep, prevStep, skipStep } =
    useOnboardingStore();

  const isSelected = (interest) => formData.interests.includes(interest);
  const isLimitReached = formData.interests.length >= 5;

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
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          Expertise & Interests
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          Select areas of interest (max 5) to tailor your scientific feed.
        </p>
      </div>

      <div className="space-y-10 py-2 pb-12">
        {Object.entries(INTEREST_CATEGORIES).map(([category, items]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-bold text-black px-1">{category}</h3>
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
                      "px-3.5 py-2 text-sm font-normal rounded-full transition-all duration-300 cursor-pointer shadow-none",
                      selected
                        ? "bg-brand-teal-600 text-white border-brand-teal-600 hover:bg-brand-teal-700 active:scale-95"
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

      <div className="flex flex-col pt-8 gap-4 border-t border-brand-gray-100">
        <Button
          onClick={nextStep}
          disabled={formData.interests.length === 0}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-50 disabled:text-white"
        >
          Confirm
        </Button>
      </div>

      {isLimitReached && (
        <p className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-brand-teal-900 text-white text-xs rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-2">
          Maximum 5 interests allowed
        </p>
      )}
    </div>
  );
};

export default OnboardingStep2;
