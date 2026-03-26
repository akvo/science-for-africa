import "@/styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import MainLayout from "@/components/layout/MainLayout";

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </div>
  );
}
