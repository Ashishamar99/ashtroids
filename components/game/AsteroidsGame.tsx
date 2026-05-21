"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

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
  isProject: boolean;
  label?: string;
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
    keys: new Set<string>(),
    score: 0,
    lives: 3,
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
    game.score = 0;
    game.lives = 3;

    game.asteroids = [];
    const projectNames = ["Ripple", "Shaadi", "AI Lab"];
    for (let i = 0; i < 8; i++) {
      const isProject = i < 3;
      game.asteroids.push({
        x: Math.random() * w,
        y: Math.random() * h,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        size: isProject ? 30 : 15 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        isProject,
        label: isProject ? projectNames[i] : undefined,
      });
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

    // Fill with solid background immediately so canvas isn't transparent
    ctx.fillStyle = "#020010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const game = gameRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        runningRef.current = false;
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

      if (game.keys.has("ArrowLeft") || game.keys.has("a")) {
        ship.rotation -= 0.06;
      }
      if (game.keys.has("ArrowRight") || game.keys.has("d")) {
        ship.rotation += 0.06;
      }
      if (game.keys.has("ArrowUp") || game.keys.has("w")) {
        ship.dx += Math.cos(ship.rotation) * 0.12;
        ship.dy += Math.sin(ship.rotation) * 0.12;
      }

      ship.dx *= 0.99;
      ship.dy *= 0.99;
      ship.x = (ship.x + ship.dx + w) % w;
      ship.y = (ship.y + ship.dy + h) % h;

      game.bullets.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;
        b.life--;
      });
      game.bullets = game.bullets.filter(
        (b) => b.life > 0 && b.x > 0 && b.x < w && b.y > 0 && b.y < h
      );

      game.asteroids.forEach((a) => {
        a.x = (a.x + a.dx + w) % w;
        a.y = (a.y + a.dy + h) % h;
        a.rotation += 0.01;
      });

      for (let bi = game.bullets.length - 1; bi >= 0; bi--) {
        const b = game.bullets[bi];
        for (let ai = game.asteroids.length - 1; ai >= 0; ai--) {
          const a = game.asteroids[ai];
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < a.size) {
            if (!a.isProject) {
              game.bullets.splice(bi, 1);
              game.asteroids.splice(ai, 1);
              game.score += 10;
              setScore(game.score);
              if (a.size > 15) {
                for (let k = 0; k < 2; k++) {
                  game.asteroids.push({
                    x: a.x,
                    y: a.y,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                    size: a.size * 0.6,
                    rotation: Math.random() * Math.PI * 2,
                    isProject: false,
                  });
                }
              }
            }
            break;
          }
        }
      }

      // Draw
      ctx.fillStyle = "#020010";
      ctx.fillRect(0, 0, w, h);

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

      if (game.keys.has("ArrowUp") || game.keys.has("w")) {
        ctx.strokeStyle = "#ff6b35";
        ctx.beginPath();
        ctx.moveTo(-ship.size * 0.5, -ship.size * 0.2);
        ctx.lineTo(-ship.size * 0.9 - Math.random() * 4, 0);
        ctx.lineTo(-ship.size * 0.5, ship.size * 0.2);
        ctx.stroke();
      }
      ctx.restore();

      // Bullets
      ctx.fillStyle = "#00ff41";
      game.bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Asteroids
      game.asteroids.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);

        if (a.isProject) {
          ctx.strokeStyle = "#6b8db5";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#6b8db5";
          ctx.shadowBlur = 8;

          const sides = 6;
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const r = a.size * (0.9 + Math.sin(angle * 3) * 0.1);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;

          if (a.label) {
            ctx.rotate(-a.rotation);
            ctx.fillStyle = "#6b8db5";
            ctx.font = "9px monospace";
            ctx.textAlign = "center";
            ctx.fillText(a.label, 0, a.size + 14);
            ctx.fillStyle = "#6b8db540";
            ctx.font = "7px monospace";
            ctx.fillText("[SHIELDED]", 0, a.size + 24);
          }
        } else {
          ctx.strokeStyle = "#4a3728";
          ctx.lineWidth = 1;
          const sides = 7;
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const r =
              a.size * (0.8 + Math.sin(angle * 2.5 + a.rotation) * 0.2);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      });

      // Spawn new junk asteroids
      if (game.asteroids.filter((a) => !a.isProject).length < 3) {
        const edge = Math.floor(Math.random() * 4);
        let x = 0,
          y = 0;
        if (edge === 0) {
          x = Math.random() * w;
          y = 0;
        } else if (edge === 1) {
          x = w;
          y = Math.random() * h;
        } else if (edge === 2) {
          x = Math.random() * w;
          y = h;
        } else {
          x = 0;
          y = Math.random() * h;
        }

        game.asteroids.push({
          x,
          y,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
          size: 15 + Math.random() * 20,
          rotation: Math.random() * Math.PI * 2,
          isProject: false,
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
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
          onClick={onExit}
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
          Shielded asteroids are projects · Press ESC or click EXIT to quit
        </p>
      </div>
    </motion.div>
  );
}
