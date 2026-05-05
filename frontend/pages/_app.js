import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "sonner";

function App({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <MainLayout
        noContainer={Component.noContainer}
        showFooter={Component.showFooter}
      >
        <Component {...pageProps} />
      </MainLayout>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default appWithTranslation(App);
