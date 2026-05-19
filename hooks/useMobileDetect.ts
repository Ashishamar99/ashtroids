"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function useMobileDetect() {
  const setIsMobile = useStore((s) => s.setIsMobile);
  const setReducedMotion = useStore((s) => s.setReducedMotion);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    mq.addEventListener("change", (e) => setReducedMotion(e.matches));

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile, setReducedMotion]);
}
