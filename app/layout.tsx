import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl, siteDescription, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: `${siteName} | Turing Award and Computing Laureates Timeline`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "computing awards",
    "computer science awards",
    "Turing Award winners",
    "AI awards",
    "database awards",
    "computing laureates timeline",
    "history of computer science",
  ],
  openGraph: {
    title: `${siteName} | Turing Award and Computing Laureates Timeline`,
    description: siteDescription,
    type: "website",
    siteName,
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Turing Award and Computing Laureates Timeline`,
    description: siteDescription,
  },
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: siteUrl } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
