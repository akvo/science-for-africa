import React from "react";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Search, Loader2 } from "lucide-react";
import { fetchFromStrapi } from "@/lib/strapi";

import { ROLE_OPTIONS } from "@/lib/onboarding-constants";

const OnboardingStep1 = () => {
  const {
    userType,
    setUserType,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    skipStep,
  } = useOnboardingStore();

  const [institutions, setInstitutions] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState(
    formData.affiliationInstitution?.name || formData.institutionName || "",
  );
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleTabChange = (value) => {
    setUserType(value);
  };

  const handleRoleChange = (value) => {
    updateFormData({ roleType: value });
  };

  const handleInstitutionSearch = async (val) => {
    setSearchTerm(val);
    // Update both fields for consistency
    updateFormData({
      institutionName: val,
      affiliationInstitution: { id: null, name: val },
    });

    if (val.length > 2) {
      setLoading(true);
      setShowDropdown(true);
      const response = await fetchFromStrapi(
        `/institutions?filters[name][$containsi]=${val}`,
      );
      if (response?.data) {
        setInstitutions(
          response.data.map((item) => ({ id: item.id, name: item.name })),
        );
      }
      setLoading(false);
    } else {
      setShowDropdown(false);
    }
  };

  const handleInstitutionSelect = (inst) => {
    setSearchTerm(inst.name);
    updateFormData({
      institutionName: inst.name,
      affiliationInstitution: inst,
    });
    setShowDropdown(false);
  };

  const isFormValid = () => {
    if (userType === "individual") {
      return !!formData.roleType;
    }
    if (userType === "institution") {
      return !!formData.roleType && !!formData.institutionName;
    }
    return false;
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-90 mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-24">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-teal-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <button
          onClick={skipStep}
          className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-3xl font-bold text-brand-teal-900 leading-tight">
          What kind of account you&apos;d like to create?
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          Select your account type to personalize your experience.
        </p>
      </div>

      <Tabs
        value={userType || "individual"}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="relative mb-8">
          <TabsList
            variant="line"
            className="flex w-full bg-transparent rounded-none h-auto px-0 py-2.5 gap-4 border-b border-brand-gray-100 pb-6"
          >
            <TabsTrigger
              value="individual"
              className="px-2 py-3 text-md font-medium"
            >
              Individual
            </TabsTrigger>
            <TabsTrigger
              value="institution"
              className="px-2 py-3 text-md font-medium"
            >
              Institution
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="individual" className="space-y-6 mb-12">
          <div className="my-16">
            <p className="text-md text-brand-gray-800 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Rhoncus quis nunc ipsum
              pellentesque praesent facilisis tempor.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="role-type"
              className="text-md font-medium text-black"
            >
              Role
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.roleType}>
              <SelectTrigger
                id="role-type"
                className="w-full h-11 px-3.5 py-2.5 bg-white border-brand-gray-100 rounded-8 focus:ring-1 focus:ring-brand-teal-500 shadow-xs text-md"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role} className="text-md">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="institution" className="space-y-6 mb-12">
          <div className="my-16">
            <p className="text-md text-brand-gray-800 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Rhoncus quis nunc ipsum
              pellentesque praesent facilisis tempor.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="inst-role-type"
              className="text-md font-medium text-black"
            >
              Role
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.roleType}>
              <SelectTrigger
                id="inst-role-type"
                className="w-full h-11 px-3.5 py-2.5 bg-white border-brand-gray-100 rounded-8 focus:ring-1 focus:ring-brand-teal-500 shadow-xs text-md"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role} className="text-md">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 relative">
            <Label
              htmlFor="institution-name"
              className="text-md font-medium text-black"
            >
              Institution
            </Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-500 transition-colors pointer-events-none">
                <Search size={20} />
              </div>
              <Input
                id="institution-name"
                placeholder="Type your institution name"
                className="w-full h-11 pl-10.5 pr-10.5 py-2.5 bg-white border-brand-gray-100 rounded-8 focus:ring-1 focus:ring-brand-teal-500 shadow-xs placeholder:text-[#667085] text-md"
                value={searchTerm}
                onChange={(e) => handleInstitutionSearch(e.target.value)}
                onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
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
                    type="button"
                    onClick={() => handleInstitutionSelect(inst)}
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
                    No institutions found. You can continue with what you typed.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(false)}
                    className="mt-2 text-sm font-medium text-brand-teal-600 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col">
        <Button
          onClick={nextStep}
          disabled={!isFormValid()}
          className="w-full h-11 rounded-full text-md font-medium transition-all duration-300 hover:shadow-lg disabled:bg-brand-teal-100 disabled:text-white"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep1;
