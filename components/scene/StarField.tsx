"use client";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  layer: number;
  color: string;
  twinkleSpeed: number;
  twinkleOffset: number;
}

const STAR_COLORS = [
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ccdcff", // blue-white (hot)
  "#aabbff", // blue
  "#ffe8c0", // warm yellow
  "#ffccaa", // orange giant
  "#ffd4d4", // red
];

const STAR_COUNT = 400;

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: STAR_COUNT }, () => {
      const layer = Math.random() < 0.15 ? 2 : Math.random() < 0.4 ? 1 : 0;
      return {
        x: Math.random(),
        y: Math.random(),
        size: layer === 2 ? 1.5 + Math.random() * 2 : 0.4 + Math.random() * 1.2,
        baseOpacity: 0.3 + Math.random() * 0.7,
        layer,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const layerSpeeds = [1.5, 4, 9];

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // Subtle nebula glow
      const grd1 = ctx.createRadialGradient(
        w * 0.3, h * 0.4, 0,
        w * 0.3, h * 0.4, w * 0.5
      );
      grd1.addColorStop(0, "rgba(30, 15, 60, 0.15)");
      grd1.addColorStop(1, "transparent");
      ctx.fillStyle = grd1;
      ctx.fillRect(0, 0, w, h);

      const grd2 = ctx.createRadialGradient(
        w * 0.75, h * 0.6, 0,
        w * 0.75, h * 0.6, w * 0.4
      );
      grd2.addColorStop(0, "rgba(15, 25, 60, 0.12)");
      grd2.addColorStop(1, "transparent");
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const t = time / 1000;

      for (const star of stars) {
        const speed = layerSpeeds[star.layer];
        const px = star.x * w + mouse.x * speed;
        const py = star.y * h + mouse.y * speed;

        // Twinkle
        const twinkle =
          0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const opacity = star.baseOpacity * twinkle;

        ctx.globalAlpha = opacity;

        if (star.size > 1.5) {
          // Bright stars get a soft glow
          const glow = ctx.createRadialGradient(px, py, 0, px, py, star.size * 3);
          glow.addColorStop(0, star.color);
          glow.addColorStop(0.3, star.color + "40");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(
            px - star.size * 3,
            py - star.size * 3,
            star.size * 6,
            star.size * 6
          );

          // Diffraction spikes for brightest stars
          if (star.size > 2) {
            ctx.globalAlpha = opacity * 0.3;
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.5;
            const spikeLen = star.size * 4;
            ctx.beginPath();
            ctx.moveTo(px - spikeLen, py);
            ctx.lineTo(px + spikeLen, py);
            ctx.moveTo(px, py - spikeLen);
            ctx.lineTo(px, py + spikeLen);
            ctx.stroke();
          }
        }

        // Core dot
        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(px, py, star.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
