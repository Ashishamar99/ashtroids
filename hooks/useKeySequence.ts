"use client";
import { useEffect, useRef } from "react";

export function useKeySequence(
  target: string,
  onMatch: () => void,
  enabled: boolean = true
) {
  const buffer = useRef("");
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      buffer.current += e.key.toUpperCase();

      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        buffer.current = "";
      }, 2000);

      if (buffer.current.includes(target.toUpperCase())) {
        buffer.current = "";
        onMatch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(timeout.current);
    };
  }, [target, onMatch, enabled]);
}
