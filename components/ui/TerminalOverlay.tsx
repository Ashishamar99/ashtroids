"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { profile } from "@/data/profile";

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  text: string;
}

const HELP_TEXT = `Available commands:
  scan          List all projects in the field
  open <name>   Navigate to a project
  about         Display identity data
  contact       Show communication channels
  links         List all transmission endpoints
  launch        Open a random project
  clear         Clear terminal buffer
  help          Show this message`;

export function TerminalOverlay() {
  const terminalOpen = useStore((s) => s.terminalOpen);
  const setTerminalOpen = useStore((s) => s.setTerminalOpen);
  const projects = useStore((s) => s.projects);
  const router = useRouter();

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "system",
      text: "ASH-TEROIDS Terminal v1.0 — Type 'help' for commands.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [terminalOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`" && !terminalOpen) {
        e.preventDefault();
        setTerminalOpen(true);
      }
      if (e.key === "Escape" && terminalOpen) {
        setTerminalOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [terminalOpen, setTerminalOpen]);

  const typeOutput = useCallback(
    (text: string, type: TerminalLine["type"] = "output") => {
      setTyping(true);
      const words = text.split(" ");
      let current = "";
      let i = 0;

      const id = setInterval(() => {
        if (i < words.length) {
          current += (i > 0 ? " " : "") + words[i];
          setLines((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (next[lastIdx]?.type === type && next[lastIdx]?.text !== text) {
              next[lastIdx] = { type, text: current };
            } else if (i === 0) {
              next.push({ type, text: current });
            } else {
              next[next.length - 1] = { type, text: current };
            }
            return next;
          });
          i++;
        } else {
          clearInterval(id);
          setTyping(false);
        }
      }, 30);
    },
    []
  );

  const processCommand = useCallback(
    (cmd: string) => {
      const parts = cmd.trim().toLowerCase().split(/\s+/);
      const command = parts[0];
      const arg = parts.slice(1).join(" ");

      setLines((prev) => [...prev, { type: "input", text: `> ${cmd}` }]);

      switch (command) {
        case "help":
          typeOutput(HELP_TEXT);
          break;

        case "scan": {
          const list = projects
            .map(
              (p) =>
                `  [${p.orbit.toUpperCase()}] ${p.title} — ${p.tagline}`
            )
            .join("\n");
          typeOutput(`Scanning field...\n\n${list}`);
          break;
        }

        case "open": {
          if (!arg) {
            typeOutput("Usage: open <project-name>", "error");
            break;
          }
          const found = projects.find(
            (p) =>
              p.title.toLowerCase().includes(arg) ||
              p.slug.toLowerCase().includes(arg)
          );
          if (found) {
            typeOutput(`Launching ${found.title}...`);
            setTimeout(() => {
              if (found.orbit === "deep") {
                router.push("/signals");
              } else {
                router.push(`/projects/${found.slug}`);
              }
            }, 800);
          } else {
            typeOutput(`Project "${arg}" not found in field.`, "error");
          }
          break;
        }

        case "about":
          typeOutput(
            `${profile.name}\n${profile.title}\n\n${profile.bio.join("\n")}\n\n${profile.tagline}`
          );
          break;

        case "contact":
          typeOutput(
            `Direct signal: ${profile.email}\n\nUse 'links' to see all transmission channels.`
          );
          break;

        case "links": {
          const links = profile.socials
            .map((s) => `  ${s.label}: ${s.url} (${s.transmission})`)
            .join("\n");
          typeOutput(`Transmission endpoints:\n\n${links}`);
          break;
        }

        case "launch": {
          const navigable = projects.filter((p) => p.orbit !== "deep");
          const random =
            navigable[Math.floor(Math.random() * navigable.length)];
          typeOutput(`Randomly selecting... ${random.title}. Launching!`);
          setTimeout(() => router.push(`/projects/${random.slug}`), 1000);
          break;
        }

        case "clear":
          setLines([]);
          break;

        default:
          typeOutput(
            `Command not recognized: "${command}". Type 'help' for available commands.`,
            "error"
          );
      }
    },
    [typeOutput, router, projects]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || typing) return;
    processCommand(input);
    setInput("");
  };

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="w-full max-w-2xl glass-strong rounded-xl overflow-hidden shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-terminal/80" />
                <span className="text-[10px] font-mono text-secondary">
                  ash-terminal
                </span>
              </div>
              <button
                onClick={() => setTerminalOpen(false)}
                className="text-secondary/40 hover:text-secondary text-xs font-mono transition-colors"
              >
                [ESC]
              </button>
            </div>

            {/* Output */}
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`whitespace-pre-wrap ${
                    line.type === "input"
                      ? "text-terminal"
                      : line.type === "error"
                        ? "text-accent-lava"
                        : line.type === "system"
                          ? "text-accent-glow"
                          : "text-primary/70"
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center border-t border-white/5 px-4 py-3"
            >
              <span className="text-terminal font-mono text-xs mr-2">
                &gt;
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs font-mono text-terminal placeholder-terminal/30"
                placeholder="type a command..."
                autoComplete="off"
                spellCheck="false"
              />
              <span className="w-2 h-4 bg-terminal animate-terminal-blink" />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
