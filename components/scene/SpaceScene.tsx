"use client";
import { useState, useEffect, useCallback } from "react";
import { StarField } from "./StarField";
import { Asteroid } from "./Asteroid";
import { SpaceStation } from "./SpaceStation";
import { Satellite } from "./Satellite";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { ORBIT_RADII } from "@/lib/constants";

const SATELLITE_COLORS: Record<string, string> = {
  github: "#6e5494",
  linkedin: "#0077b5",
  instagram: "#e1306c",
  file: "#f0c040",
};

export function SpaceScene() {
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const update = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setZoom((z) => Math.max(0.4, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  const cx = dims.w / 2;
  const cy = dims.h / 2;

  const innerProjects = projects.filter((p) => p.orbit === "inner");
  const midProjects = projects.filter((p) => p.orbit === "mid");
  const deepProjects = projects.filter((p) => p.orbit === "deep");

  const innerR = ORBIT_RADII.inner * 40 * zoom;
  const midR = ORBIT_RADII.mid * 40 * zoom;
  const deepR = ORBIT_RADII.deep * 40 * zoom;
  const satR = 80 * zoom;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onWheel={handleWheel}
    >
      <StarField />

      {/* Orbit rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <ellipse
          cx={cx}
          cy={cy}
          rx={innerR}
          ry={innerR * 0.45}
          fill="none"
          stroke="rgba(42,42,94,0.25)"
          strokeWidth={1}
          strokeDasharray="4 6"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={midR}
          ry={midR * 0.45}
          fill="none"
          stroke="rgba(26,26,78,0.15)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={deepR}
          ry={deepR * 0.45}
          fill="none"
          stroke="rgba(16,16,62,0.08)"
          strokeWidth={1}
          strokeDasharray="3 10"
        />
      </svg>

      {/* Space Station at center */}
      <SpaceStation centerX={cx} centerY={cy} />

      {/* Satellites */}
      {profile.socials.map((social, i) => (
        <Satellite
          key={social.label}
          label={social.label}
          url={social.url}
          transmission={social.transmission}
          orbitRadius={satR}
          speed={0.3 + i * 0.1}
          startAngle={(i / profile.socials.length) * Math.PI * 2}
          color={SATELLITE_COLORS[social.icon] || "#6b8db5"}
          centerX={cx}
          centerY={cy}
        />
      ))}

      {/* Asteroids */}
      {innerProjects.map((p, i) => (
        <Asteroid
          key={p.slug}
          project={p}
          index={i}
          totalInOrbit={innerProjects.length}
          centerX={cx}
          centerY={cy}
          zoom={zoom}
        />
      ))}
      {midProjects.map((p, i) => (
        <Asteroid
          key={p.slug}
          project={p}
          index={i}
          totalInOrbit={midProjects.length}
          centerX={cx}
          centerY={cy}
          zoom={zoom}
        />
      ))}
      {deepProjects.map((p, i) => (
        <Asteroid
          key={p.slug}
          project={p}
          index={i}
          totalInOrbit={deepProjects.length}
          centerX={cx}
          centerY={cy}
          zoom={zoom}
        />
      ))}
    </div>
  );
}
