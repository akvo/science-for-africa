import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import { SignUpForm } from "@/components/auth/signup-form";
import { SocialButton } from "@/components/auth/social-auth";

const SignupPage = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Meta title={t("signup.title")} />
      <div className="space-y-2 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 tracking-tight">
          {t("signup.title")}
        </h1>
        <p className="text-brand-gray-500 font-medium text-sm">
          {t("signup.description")}
        </p>
      </div>

      <SignUpForm />

      <div className="relative flex items-center gap-4">
        <div className="h-px grow bg-brand-gray-100"></div>
        <span className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest whitespace-nowrap">
          {t("signup.or_continue_with")}
        </span>
        <div className="h-px grow bg-brand-gray-100"></div>
      </div>

      <SocialButton provider="google" />

      <p className="text-center text-sm text-brand-gray-500 font-medium pt-2">
        {t("signup.already_have_account")}{" "}
        <Link
          href="/login"
          className="text-brand-teal-700 font-bold hover:text-brand-teal-900 transition-colors"
        >
          {t("signup.login")}
        </Link>
      </p>
    </div>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "auth"])),
    },
  };
}

export default SignupPage;
