"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Award-winning smooth entry transition for every page load/navigation
      gsap.fromTo(
        container.current,
        {
          opacity: 0,
          y: 16,
          filter: "blur(12px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.85,
          ease: "power3.out",
          clearProps: "all", // Strip inline styles once done for clean DOM
        }
      );
    },
    { scope: container }
  );

  return <div ref={container}>{children}</div>;
}
