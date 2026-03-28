import React from "react";
import { useRouter } from "next/router";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { email } = router.query;

  return <VerifyEmailContent email={email} />;
};

export default VerifyEmailPage;
