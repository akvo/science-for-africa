import React from "react";
import { useRouter } from "next/router";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { email, confirmation } = router.query;

  return <VerifyEmailContent email={email} confirmation={confirmation} />;
};


export default VerifyEmailPage;
