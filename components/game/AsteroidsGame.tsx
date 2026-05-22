"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  playShoot,
  playHitNormal,
  playHitBonus,
  startThrust,
  stopThrust,
} from "@/lib/gameAudio";

interface Entity {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  rotation: number;
}

interface Bullet extends Entity {
  life: number;
}

interface GameAsteroid extends Entity {
  type: "normal" | "bonus";
  flash: number;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
  size: number;
}

interface AsteroidsGameProps {
  onExit: () => void;
}

export function AsteroidsGame({ onExit }: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives] = useState(3);
  const runningRef = useRef(true);
  const gameRef = useRef({
    ship: { x: 0, y: 0, dx: 0, dy: 0, size: 12, rotation: 0 } as Entity,
    bullets: [] as Bullet[],
    asteroids: [] as GameAsteroid[],
    particles: [] as Particle[],
    keys: new Set<string>(),
    score: 0,
    lastBonusSpawn: 0,
    thrusting: false,
  });

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const game = gameRef.current;

    game.ship = {
      x: w / 2,
      y: h / 2,
      dx: 0,
      dy: 0,
      size: 12,
      rotation: -Math.PI / 2,
    };
    game.bullets = [];
    game.particles = [];
    game.score = 0;
    game.lastBonusSpawn = performance.now();
    game.thrusting = false;

    game.asteroids = [];
    for (let i = 0; i < 5; i++) {
      game.asteroids.push(spawnNormal(w, h));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    runningRef.current = true;
    initGame();

    ctx.fillStyle = "#020010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const game = gameRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        runningRef.current = false;
        if (game.thrusting) {
          stopThrust();
          game.thrusting = false;
        }
        onExit();
        return;
      }
      game.keys.add(e.key);
      if (e.key === " ") {
        e.preventDefault();
        const ship = game.ship;
        game.bullets.push({
          x: ship.x + Math.cos(ship.rotation) * ship.size,
          y: ship.y + Math.sin(ship.rotation) * ship.size,
          dx: Math.cos(ship.rotation) * 6,
          dy: Math.sin(ship.rotation) * 6,
          size: 2,
          rotation: 0,
          life: 60,
        });
        playShoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      game.keys.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animId: number;

    const loop = () => {
      if (!runningRef.current) return;

      const w = canvas.width;
      const h = canvas.height;
      const ship = game.ship;
      const now = performance.now();

      // Ship controls
      if (game.keys.has("ArrowLeft") || game.keys.has("a")) {
        ship.rotation -= 0.06;
      }
      if (game.keys.has("ArrowRight") || game.keys.has("d")) {
        ship.rotation += 0.06;
      }

      const wantsThrust =
        game.keys.has("ArrowUp") || game.keys.has("w");
      if (wantsThrust) {
        ship.dx += Math.cos(ship.rotation) * 0.12;
        ship.dy += Math.sin(ship.rotation) * 0.12;
        if (!game.thrusting) {
          startThrust();
          game.thrusting = true;
        }
      } else if (game.thrusting) {
        stopThrust();
        game.thrusting = false;
      }

      ship.dx *= 0.99;
      ship.dy *= 0.99;
      ship.x = (ship.x + ship.dx + w) % w;
      ship.y = (ship.y + ship.dy + h) % h;

      // Bullets
      game.bullets.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;
        b.life--;
      });
      game.bullets = game.bullets.filter(
        (b) => b.life > 0 && b.x > 0 && b.x < w && b.y > 0 && b.y < h
      );

      // Asteroids
      game.asteroids.forEach((a) => {
        a.x = (a.x + a.dx + w) % w;
        a.y = (a.y + a.dy + h) % h;
        a.rotation += a.type === "bonus" ? 0.03 : 0.01;
        if (a.flash > 0) a.flash -= 0.05;
      });

      // Particles
      game.particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
        p.dx *= 0.98;
        p.dy *= 0.98;
      });
      game.particles = game.particles.filter((p) => p.life > 0);

      // Bullet-asteroid collision
      for (let bi = game.bullets.length - 1; bi >= 0; bi--) {
        const b = game.bullets[bi];
        for (let ai = game.asteroids.length - 1; ai >= 0; ai--) {
          const a = game.asteroids[ai];
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < a.size) {
            game.bullets.splice(bi, 1);

            if (a.type === "bonus") {
              game.asteroids.splice(ai, 1);
              game.score += 50;
              playHitBonus();
              spawnExplosion(game.particles, a.x, a.y, "#40e0ff", 12);
            } else {
              game.asteroids.splice(ai, 1);
              game.score += 10;
              playHitNormal();
              spawnExplosion(game.particles, a.x, a.y, "#ff6b35", 6);

              if (a.size > 15) {
                for (let k = 0; k < 2; k++) {
                  game.asteroids.push({
                    x: a.x,
                    y: a.y,
                    dx: (Math.random() - 0.5) * 2.5,
                    dy: (Math.random() - 0.5) * 2.5,
                    size: a.size * 0.6,
                    rotation: Math.random() * Math.PI * 2,
                    type: "normal",
                    flash: 0,
                  });
                }
              }
            }

            setScore(game.score);
            break;
          }
        }
      }

      // Spawn logic
      if (game.asteroids.filter((a) => a.type === "normal").length < 4) {
        game.asteroids.push(spawnNormal(w, h));
      }
      if (now - game.lastBonusSpawn > 15000) {
        game.asteroids.push(spawnBonus(w, h));
        game.lastBonusSpawn = now;
      }

      // --- DRAW ---
      ctx.fillStyle = "#020010";
      ctx.fillRect(0, 0, w, h);

      // Particles
      game.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Ship
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.rotation);
      ctx.strokeStyle = "#00ff41";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ship.size, 0);
      ctx.lineTo(-ship.size * 0.7, -ship.size * 0.6);
      ctx.lineTo(-ship.size * 0.4, 0);
      ctx.lineTo(-ship.size * 0.7, ship.size * 0.6);
      ctx.closePath();
      ctx.stroke();

      if (wantsThrust) {
        ctx.strokeStyle = "#ff6b35";
        ctx.beginPath();
        ctx.moveTo(-ship.size * 0.5, -ship.size * 0.2);
        ctx.lineTo(-ship.size * 0.9 - Math.random() * 6, 0);
        ctx.lineTo(-ship.size * 0.5, ship.size * 0.2);
        ctx.stroke();
      }
      ctx.restore();

      // Bullets
      ctx.fillStyle = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 4;
      game.bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Asteroids
      game.asteroids.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);

        if (a.type === "bonus") {
          // Cyan glowing bonus asteroid
          ctx.strokeStyle = "#40e0ff";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#40e0ff";
          ctx.shadowBlur = a.flash > 0 ? 20 : 10;

          const sides = 5;
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const r = a.size * (0.85 + Math.sin(angle * 2 + a.rotation * 3) * 0.15);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          // Inner glow
          ctx.fillStyle = "rgba(64, 224, 255, 0.08)";
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.rotate(-a.rotation);
          ctx.fillStyle = "#40e0ff";
          ctx.font = "7px monospace";
          ctx.textAlign = "center";
          ctx.fillText("+50", 0, a.size + 12);
        } else {
          // Orange normal asteroid
          ctx.strokeStyle = "#ff6b35";
          ctx.lineWidth = 1.2;
          ctx.shadowColor = "#ff6b35";
          ctx.shadowBlur = a.flash > 0 ? 12 : 0;

          const sides = 7;
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const r =
              a.size * (0.75 + Math.sin(angle * 2.5 + a.rotation) * 0.25);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (game.thrusting) {
        stopThrust();
        game.thrusting = false;
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [initGame, onExit]);

  return (
    <motion.div
      className="fixed inset-0"
      style={{ zIndex: 70 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      <div className="absolute top-6 left-6 font-mono text-xs">
        <p className="text-terminal">SCORE: {score}</p>
        <p className="text-accent-lava mt-1">
          LIVES: {"+ ".repeat(lives).trim()}
        </p>
      </div>

      <div className="absolute top-6 right-6">
        <button
          onClick={() => {
            runningRef.current = false;
            const game = gameRef.current;
            if (game.thrusting) {
              stopThrust();
              game.thrusting = false;
            }
            onExit();
          }}
          className="glass rounded-lg px-4 py-2 text-accent-lava hover:text-primary font-mono text-sm transition-colors"
        >
          [ESC] EXIT GAME
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center glass rounded-lg px-4 py-2">
        <p className="text-xs font-mono text-secondary">
          ARROWS / WASD to move · SPACE to shoot
        </p>
        <p className="text-[10px] font-mono text-secondary/50 mt-1">
          <span className="text-accent-lava">Orange</span> = +10 pts ·{" "}
          <span className="text-accent-ice">Cyan</span> = +50 bonus ·
          ESC to quit
        </p>
      </div>
    </motion.div>
  );
}

function spawnFromEdge(w: number, h: number): { x: number; y: number } {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: Math.random() * w, y: -20 };
  if (edge === 1) return { x: w + 20, y: Math.random() * h };
  if (edge === 2) return { x: Math.random() * w, y: h + 20 };
  return { x: -20, y: Math.random() * h };
}

function spawnNormal(w: number, h: number): GameAsteroid {
  const pos = spawnFromEdge(w, h);
  return {
    ...pos,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
    size: 18 + Math.random() * 22,
    rotation: Math.random() * Math.PI * 2,
    type: "normal",
    flash: 0,
  };
}

function spawnBonus(w: number, h: number): GameAsteroid {
  const pos = spawnFromEdge(w, h);
  return {
    ...pos,
    dx: (Math.random() - 0.5) * 3,
    dy: (Math.random() - 0.5) * 3,
    size: 10 + Math.random() * 8,
    rotation: Math.random() * Math.PI * 2,
    type: "bonus",
    flash: 0,
  };
}

function spawnExplosion(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.5,
      color,
      size: 1 + Math.random() * 2,
    });
  }
}
