import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

const ResetPasswordPage = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="w-full">
      <Meta title={t("reset_password.title")} />
      <ResetPasswordForm />
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

export default ResetPasswordPage;
