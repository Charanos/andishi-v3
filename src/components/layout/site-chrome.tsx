"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dev");
  const hideFooter = pathname === "/start-project" || pathname === "/login" || isAppRoute;

  return (
    <>
      {!isAppRoute && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
