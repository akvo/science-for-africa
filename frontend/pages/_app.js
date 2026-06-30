import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";

import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "sonner";

function App({ Component, pageProps }) {
  return (
    <div>
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
