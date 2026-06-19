import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteChrome } from "@/components/layout/site-chrome";
import { siteConfig } from "@/config/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const jetBrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Andishi - Software Development Studio",
  description:
    "We design, build, and ship custom software, SaaS platforms, AI systems, and mobile apps with senior engineering discipline.",
  applicationName: siteConfig.name,
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Andishi - Software Development Studio",
    description:
      "Nairobi-led global software studio delivering custom software, SaaS platforms, AI systems, and mobile apps with full IP ownership.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Andishi - Software Development Studio",
    description: siteConfig.description,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  foundingLocation: "Nairobi, Kenya",
  description:
    "Nairobi-led global software development studio building custom software, SaaS platforms, AI systems, and mobile apps.",
  areaServed: ["United States", "United Kingdom", "European Union", "GCC", "Africa"],
  serviceType: [
    "Custom Software Development",
    "SaaS Platform Development",
    "AI Systems & Integrations",
    "Mobile Application Development",
    "APIs & Integrations",
    "Dedicated Build Teams",
    "Engineering Staff Augmentation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${outfit.variable} ${jetBrains.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
