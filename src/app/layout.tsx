import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Andishi - Senior African Engineers for Global Startups",
  description:
    "Hire vetted senior engineers from Africa. Full-stack, AI, Web3, AWS, blockchain, backend, and mobile talent that ships.",
  applicationName: siteConfig.name,
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Andishi - Senior African Engineers for Global Startups",
    description:
      "The engineering partner global startups use to hire vetted senior African software engineers without a long recruiting cycle.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Andishi - Senior African Engineers for Global Startups",
    description: siteConfig.description,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  foundingLocation: "Africa",
  description:
    "African engineering talent company placing senior, vetted software engineers with global startups and technology companies.",
  areaServed: ["United States", "United Kingdom", "European Union", "GCC", "Africa"],
  serviceType: [
    "Engineering Talent Placement",
    "Team Extension",
    "Contract Software Engineers",
    "Dedicated Build Teams",
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
      className={`${outfit.variable} ${jetBrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
