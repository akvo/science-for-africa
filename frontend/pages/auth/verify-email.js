import React from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { email, confirmation } = router.query;

  return <VerifyEmailContent email={email} confirmation={confirmation} />;
};

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "auth"])),
    },
  };
}

export default VerifyEmailPage;
