import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

const ForgotPasswordPage = () => {
  return (
    <div className="w-full">
      <ForgotPasswordForm />
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

export default ForgotPasswordPage;
