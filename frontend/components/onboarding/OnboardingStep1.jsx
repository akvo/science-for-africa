import React, { useState, useRef } from "react";
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
import { Search, Loader2 } from "lucide-react";
import { fetchLocalized } from "@/lib/strapi";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { ROLE_OPTIONS } from "@/lib/onboarding-constants";

const OnboardingStep1 = () => {
  const { t } = useTranslation("onboarding");
  const router = useRouter();
  const { locale } = router;
  const {
    userType,
    setUserType,
    formData,
    updateFormData,
    nextStep,
    skipStep,
  } = useOnboardingStore();

  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    formData.affiliationInstitution?.name || formData.institutionName || "",
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (value) => {
    setUserType(value);
  };

  const handleRoleChange = (value) => {
    updateFormData({ roleType: value });
  };

  const searchTimeoutRef = useRef(null);

  const handleInstitutionSearch = async (val) => {
    setSearchTerm(val);
    updateFormData({
      institutionName: val,
      affiliationInstitution: { id: null, name: val },
    });

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
      <div className="flex items-center justify-end mb-24">
        <button
          onClick={skipStep}
          className="text-brand-gray-500 hover:text-brand-teal-700 transition-colors"
        >
          {t("steps.skip")}
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-3 mb-32">
        <h1 className="text-3xl font-bold text-brand-teal-900 leading-tight">
          {t("step1.title")}
        </h1>
        <p className="text-md text-brand-gray-800 leading-relaxed">
          {t("step1.description")}
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
              {t("step1.individual_tab")}
            </TabsTrigger>
            <TabsTrigger
              value="institution"
              className="px-2 py-3 text-md font-medium"
            >
              {t("step1.institution_tab")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="individual" className="space-y-6 mb-12">
          <div className="my-16">
            <p className="text-md text-brand-gray-800 leading-relaxed">
              {t("step1.individual_desc")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="role-type"
              className="text-md font-medium text-black"
            >
              {t("step1.role_label")}
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.roleType}>
              <SelectTrigger
                id="role-type"
                className="w-full h-11 px-3.5 py-2.5 bg-white border-brand-gray-100 rounded-8 focus:ring-1 focus:ring-brand-teal-500 shadow-xs text-md"
              >
                <SelectValue placeholder={t("step1.role_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role} className="text-md">
                    {t(`roles.${role}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="institution" className="space-y-6 mb-12">
          <div className="my-16">
            <p className="text-md text-brand-gray-800 leading-relaxed">
              {t("step1.institution_desc")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="inst-role-type"
              className="text-md font-medium text-black"
            >
              {t("step1.role_label")}
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.roleType}>
              <SelectTrigger
                id="inst-role-type"
                className="w-full h-11 px-3.5 py-2.5 bg-white border-brand-gray-100 rounded-8 focus:ring-1 focus:ring-brand-teal-500 shadow-xs text-md"
              >
                <SelectValue placeholder={t("step1.role_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role} className="text-md">
                    {t(`roles.${role}`)}
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
              {t("step1.institution_label")}
            </Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-500 transition-colors pointer-events-none">
                <Search size={20} />
              </div>
              <Input
                id="institution-name"
                placeholder={t("step1.institution_placeholder")}
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
                    {t("step1.no_institutions_found")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(false)}
                    className="mt-2 text-sm font-medium text-brand-teal-600 hover:underline"
                  >
                    {t("step1.dismiss")}
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
          {t("steps.confirm")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep1;
