import type { Metadata } from "next";
import { Montserrat, Noto_Serif_JP, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const notoJP = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Template Builder",
  description: "Générateur de templates HTML par glisser-déposer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${montserrat.variable} ${notoJP}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
