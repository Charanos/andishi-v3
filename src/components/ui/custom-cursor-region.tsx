"use client";

import { useReducedMotion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export function CustomCursorRegion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [hoveringAction, setHoveringAction] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frame = 0;

    const animateRing = () => {
      const pointer = pointerRef.current;
      pointer.rx += (pointer.mx - pointer.rx) * 0.12;
      pointer.ry += (pointer.my - pointer.ry) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pointer.rx}px, ${pointer.ry}px, 0) translate(-50%, -50%)`;
      }

      frame = window.requestAnimationFrame(animateRing);
    };

    frame = window.requestAnimationFrame(animateRing);
    return () => window.cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || prefersReducedMotion) return;

    pointerRef.current.mx = event.clientX;
    pointerRef.current.my = event.clientY;

    const target = event.target;
    if (target instanceof Element) {
      setHoveringAction(
        Boolean(target.closest("a, button, input, textarea, select, [role='button']")),
      );
      const customCursorTarget = target.closest("[data-cursor-text]");
      if (customCursorTarget) {
        setCursorText(customCursorTarget.getAttribute("data-cursor-text"));
      } else {
        setCursorText(null);
      }
    }

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    }
  };

  return (
    <div
      className={`relative md:[cursor:none] ${className}`}
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => {
        setVisible(false);
        setHoveringAction(false);
      }}
      onPointerMove={handlePointerMove}
    >
      {children}

      {!prefersReducedMotion && (
        <>
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[100] hidden flex-col items-center justify-center overflow-hidden rounded-full mix-blend-difference transition-[height,width,opacity,background-color] duration-300 md:flex"
            style={{
              opacity: visible ? 1 : 0,
              width: cursorText ? 72 : hoveringAction ? 46 : 10,
              height: cursorText ? 72 : hoveringAction ? 46 : 10,
              backgroundColor: cursorText
                ? "var(--secondary)"
                : hoveringAction
                  ? "color-mix(in srgb, var(--secondary) 18%, transparent)"
                  : "var(--secondary)",
            }}
          >
            {cursorText && (
              <span className="font-mono text-[0.65rem] font-medium tracking-widest text-white whitespace-nowrap text-center opacity-100">
                {cursorText}
              </span>
            )}
          </div>
          <div
            ref={ringRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[99] hidden h-9 w-9 rounded-full border border-[color-mix(in_srgb,var(--secondary)_48%,transparent)] transition-opacity duration-300 md:block"
            style={{ opacity: visible && !hoveringAction && !cursorText ? 1 : 0 }}
          />
        </>
      )}
    </div>
  );
}
