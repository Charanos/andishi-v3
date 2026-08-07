"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FloatingWhatsappButton } from "@/components/layout/floating-whatsapp-button";
import { BackButton } from "@/components/ui/back-button";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dev");
  const hideFooter = pathname === "/start-project" || pathname === "/login" || isAppRoute;

  const showWhatsapp = !isAppRoute && pathname !== "/contact";
  const showBackButton = !isAppRoute && pathname !== "/";

  return (
    <>
      {!isAppRoute && <Navbar />}
      {children}
      {showBackButton && <BackButton />}
      {showWhatsapp && <FloatingWhatsappButton />}
      {!hideFooter && <Footer />}
    </>
  );
}
