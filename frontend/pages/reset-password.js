import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

const ResetPasswordPage = () => {
  return (
    <div className="w-full">
      <ResetPasswordForm />
    </div>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default ResetPasswordPage;
