import type { Metadata } from "next";
import "./globals.css";
import { getEffectiveSiteUrl, getSiteUrl, getSocialImageUrl, siteDescription, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const metadataBase = new URL(getEffectiveSiteUrl());
const socialImageUrl = getSocialImageUrl();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteName} | Major Computing Awards and Laureates`,
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
    title: `${siteName} | Major Computing Awards and Laureates`,
    description: siteDescription,
    type: "website",
    siteName,
    images: [{ url: socialImageUrl }],
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Major Computing Awards and Laureates`,
    description: siteDescription,
    images: [socialImageUrl],
  },
  ...(siteUrl ? { alternates: { canonical: siteUrl } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
