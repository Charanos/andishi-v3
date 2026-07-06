"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useDetailsPopover() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const node = ref.current;
      if (!node?.open) return;
      if (event.target instanceof Node && !node.contains(event.target)) {
        node.open = false;
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  // AppShell lives at the role layout level, so navigating to another page
  // in the same section doesn't remount it - without this, clicking a link
  // inside an open popover (a notification, a quick action) would leave the
  // panel floating open over the destination page.
  useEffect(() => {
    if (ref.current?.open) ref.current.open = false;
  }, [pathname]);

  return ref;
}
