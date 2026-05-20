import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { exchangeOrcidCode, getMe } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function OrcidCallbackPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateFormData = useOnboardingStore((s) => s.updateFormData);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const { code, state, error } = router.query;

    if (error) {
      setTimeout(() => {
        setStatus("error");
        setErrorMsg("ORCID authentication was denied or cancelled.");
      }, 0);
      return;
    }

    if (!code) return; // wait for query params

    (async () => {
      const result = await exchangeOrcidCode(code, state);

      if (result?.data?.verified) {
        setStatus("success");

        // Update auth store with fresh user data
        const freshUser = await getMe();
        if (freshUser) {
          updateUser(freshUser);
        }

        // If coming from onboarding, update the onboarding store too
        if (result.data.returnTo === "onboarding") {
          updateFormData({
            orcidId: result.data.orcidId,
            orcidVerified: true,
          });
        }

        // Redirect after short delay
        setTimeout(() => {
          if (result.data.returnTo === "onboarding") {
            router.replace("/onboarding");
          } else {
            router.replace("/profile");
          }
        }, 1500);
      } else {
        setStatus("error");
        setErrorMsg("Could not verify ORCID. Please try again.");
      }
    })();
  }, [router.isReady, router.query, updateUser, updateFormData, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gray-25">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="size-10 animate-spin text-brand-teal-600 mx-auto" />
            <p className="text-lg font-medium text-brand-gray-700">
              {t("verification.verifying")}
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="size-10 text-emerald-600 mx-auto" />
            <p className="text-lg font-bold text-brand-gray-900">
              ORCID Validated
            </p>
            <p className="text-sm text-brand-gray-500">Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="size-10 text-red-500 mx-auto" />
            <p className="text-lg font-bold text-brand-gray-900">
              Verification Failed
            </p>
            <p className="text-sm text-brand-gray-500">{errorMsg}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-sm font-medium text-brand-teal-600 hover:underline"
            >
              Go back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
