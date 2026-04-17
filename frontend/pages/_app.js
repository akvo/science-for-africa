import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

import MainLayout from "@/components/layout/MainLayout";

function App({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </div>
  );
}

export default appWithTranslation(App);
