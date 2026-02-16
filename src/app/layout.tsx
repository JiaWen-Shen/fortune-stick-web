import type { Metadata } from "next";
import { Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "籤詩解讀 — 傳統籤詩個人化解讀服務",
  description:
    "提供觀音靈籤、關帝靈籤、六十甲子籤、媽祖靈籤、呂祖靈籤的個人化 AI 解讀服務。輸入您的籤號與問題，獲得專屬解讀。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${notoSerifTC.variable} ${notoSansTC.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
