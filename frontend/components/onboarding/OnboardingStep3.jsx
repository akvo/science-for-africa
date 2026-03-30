import React from "react";
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
import { ArrowLeft } from "lucide-react";

const EDUCATION_LEVELS = [
  "High School",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Post-Doctorate",
  "Professional Certificate",
];

const OnboardingStep3 = () => {
  const { formData, updateFormData, nextStep, prevStep, skipStep } =
    useOnboardingStore();

  const handleConfirm = () => {
    nextStep();
  };

  const isFormValid =
    formData.educationLevel && formData.educationInstitution.trim() !== "";

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
          Education and career
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          Help us understand your background to provide more relevant
          scientific opportunities.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 mb-12">
        {/* Education Level */}
        <div className="space-y-2">
          <label className="text-md font-medium text-black">
            Education level
          </label>
          <Select
            value={formData.educationLevel}
            onValueChange={(val) => updateFormData({ educationLevel: val })}
          >
            <SelectTrigger className="w-full h-11 px-3.5 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level} className="text-md">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Institution Name */}
        <div className="space-y-2">
          <label className="text-md font-medium text-black">
            Name of educational institution
          </label>
          <Input
            value={formData.educationInstitution}
            onChange={(e) =>
              updateFormData({ educationInstitution: e.target.value })
            }
            placeholder="Type your institution name"
            className="w-full h-11 px-3.5 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col pt-8 border-t border-brand-gray-100">
        <Button
          onClick={handleConfirm}
          disabled={!isFormValid}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-50 disabled:text-white"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep3;
