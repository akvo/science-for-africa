import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { email, confirmation } = router.query;
  const { t } = useTranslation("auth");

  return (
    <>
      <Meta title={t("verify_email.confirm_title")} />
      <VerifyEmailContent email={email} confirmation={confirmation} />
    </>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "auth"])),
    },
  };
}

export default VerifyEmailPage;
