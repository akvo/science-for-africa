import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import AuthLayout from "@/components/layout/AuthLayout";
import { useOnboardingStore } from "@/lib/onboarding-store";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";

const OnboardingPage = () => {
  const { step } = useOnboardingStore();
  const { t } = useTranslation("common");

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OnboardingStep1 />;
      case 2:
        return <OnboardingStep2 />;
      case 3:
        return <OnboardingStep3 />;
      case 4:
        return <OnboardingStep4 />;
      case 5:
        return <OnboardingStep5 />;
      default:
        return <OnboardingStep1 />;
    }
  };

  return (
    <div className="w-full">
      <Meta title={t("seo.onboarding_title")} />
      {renderStep()}
    </div>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "onboarding"])),
    },
  };
}

export default OnboardingPage;
