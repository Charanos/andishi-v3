"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname === "/start-project" || pathname === "/login";

  return (
    <>
      <Navbar />
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
