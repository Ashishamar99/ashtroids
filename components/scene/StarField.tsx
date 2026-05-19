"use client";
import { useMemo, useRef, useEffect, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: number;
}

const STAR_COUNT = 300;

export function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.6,
      layer: Math.floor(Math.random() * 3),
    }));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const layerSpeeds = [2, 5, 10];

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {stars.map((star, i) => {
        const speed = layerSpeeds[star.layer];
        const tx = mouse.x * speed;
        const ty = mouse.y * speed;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.layer === 2 ? "#aaccff" : "#ffffff",
              opacity: star.opacity,
              transform: `translate(${tx}px, ${ty}px)`,
              transition: "transform 0.3s ease-out",
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
