"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { SpaceScene } from "@/components/scene/SpaceScene";
import { HUD } from "@/components/ui/HUD";
import { AboutOverlay } from "@/components/ui/AboutOverlay";
import { ProjectOverlay } from "@/components/ui/ProjectOverlay";
import { RecruiterMode } from "@/components/ui/RecruiterMode";
import { TerminalOverlay } from "@/components/ui/TerminalOverlay";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useKeySequence } from "@/hooks/useKeySequence";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { useStore } from "@/lib/store";
import { getStaticProjects, loadProjects } from "@/lib/projects";

const AsteroidsGame = dynamic(
  () =>
    import("@/components/game/AsteroidsGame").then((mod) => ({
      default: mod.AsteroidsGame,
    })),
  { ssr: false }
);

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const gameActive = useStore((s) => s.gameActive);
  const setGameActive = useStore((s) => s.setGameActive);
  const viewMode = useStore((s) => s.viewMode);
  const terminalOpen = useStore((s) => s.terminalOpen);
  const setProjects = useStore((s) => s.setProjects);

  useMobileDetect();

  useEffect(() => {
    // Show bundled config immediately, then refresh from live config
    setProjects(getStaticProjects());
    loadProjects().then(setProjects);
  }, [setProjects]);

  const handleGameActivate = useCallback(() => {
    if (!terminalOpen) {
      setGameActive(true);
    }
  }, [setGameActive, terminalOpen]);

  useKeySequence("ASHTEROID", handleGameActivate, !gameActive);

  return (
    <main className="h-full relative overflow-hidden bg-space">
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {viewMode === "orbit" && <SpaceScene />}

      {loaded && (
        <>
          <HUD />
          <AboutOverlay />
          <ProjectOverlay />
          <RecruiterMode />
          <TerminalOverlay />

          {gameActive && (
            <AsteroidsGame onExit={() => setGameActive(false)} />
          )}
        </>
      )}
    </main>
  );
}
