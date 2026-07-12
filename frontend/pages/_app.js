import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";

import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "sonner";

function App({ Component, pageProps }) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      if (url !== router.asPath) setNavigating(true);
    };
    const handleComplete = () => setNavigating(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <div>
      <MainLayout
        noContainer={Component.noContainer}
        showFooter={Component.showFooter}
      >
        <div
          className={
            navigating
              ? "pointer-events-none opacity-100 transition-none"
              : undefined
          }
          style={navigating ? { minHeight: "100vh" } : undefined}
        >
          <Component {...pageProps} />
        </div>
      </MainLayout>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default appWithTranslation(App);
