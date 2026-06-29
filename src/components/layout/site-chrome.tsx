"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FloatingWhatsappButton } from "@/components/layout/floating-whatsapp-button";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dev");
  const hideFooter = pathname === "/start-project" || pathname === "/login" || isAppRoute;

  const showWhatsapp = !isAppRoute && pathname !== "/contact";

  return (
    <>
      {!isAppRoute && <Navbar />}
      {children}
      {showWhatsapp && <FloatingWhatsappButton />}
      {!hideFooter && <Footer />}
    </>
  );
}
