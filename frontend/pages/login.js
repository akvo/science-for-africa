import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { LoginForm } from "@/components/auth/login-form";

const LoginPage = () => {
  return (
    <div className="w-full">
      <LoginForm />
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

export default LoginPage;
