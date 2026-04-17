import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import { LoginForm } from "@/components/auth/login-form";

const LoginPage = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="w-full">
      <Meta title={t("login.title")} />
      <LoginForm />
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

export default LoginPage;
