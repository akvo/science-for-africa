import React, { useState } from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchFromStrapi, updateUserProfile } from "@/lib/strapi";
import { useRouter } from "next/router";

const OnboardingStep5 = () => {
  const router = useRouter();
  const { formData, updateFormData, prevStep, userType } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    formData.affiliationInstitution || "",
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (val) => {
    setSearchTerm(val);
    updateFormData({ affiliationInstitution: val });

    if (val.length > 2) {
      setLoading(true);
      setShowDropdown(true);
      const response = await fetchFromStrapi(
        `/institutions?filters[name][$containsi]=${val}`,
      );
      if (response?.data) {
        setInstitutions(response.data.map((item) => item.name));
      }
      setLoading(false);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (name) => {
    setSearchTerm(name);
    updateFormData({ affiliationInstitution: name });
    setShowDropdown(false);
  };

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
      <div className="flex items-center justify-between mb-24">
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
      <div className="space-y-3 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 leading-tight">
          Institutional affiliation
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          We'll suggest research partners and funders based on your
          institutional affiliation.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6 mb-12">
        <div className="space-y-2 relative">
          <label className="text-md font-medium text-black">
            Search institution
          </label>
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
              placeholder="Type your primary institution"
              className="w-full h-11 px-3.5 py-2.5 border-brand-gray-100 rounded-8 text-md focus:ring-brand-teal-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-teal-600" />
              </div>
            )}
          </div>

          {showDropdown && institutions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-brand-gray-100 rounded-8 shadow-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
              {institutions.map((name, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(name)}
                  className="w-full text-left px-4 py-3 hover:bg-brand-teal-50 transition-colors text-md text-brand-gray-900 border-b last:border-0 border-brand-gray-50"
                >
                  {name}
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
                  No institutions found. You can continue with what you typed.
                </p>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="mt-2 text-sm font-medium text-brand-teal-600 hover:underline"
                >
                  Dismiss
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
              Finishing...
            </>
          ) : (
            "Confirm"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep5;
