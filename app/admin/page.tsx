"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  AshteroidsConfig,
  RepoConfig,
  ManualProject,
} from "@/data/projects";
import type { GitHubRepo } from "@/lib/projects";

type AuthStatus = {
  adminAuthenticated: boolean;
  authenticated: boolean;
  user?: { login: string; avatar_url: string; name: string };
};

const ORBIT_OPTIONS = ["inner", "mid", "deep"] as const;
const CATEGORY_OPTIONS = [
  "flagship",
  "startup",
  "infra",
  "experiment",
  "thought",
] as const;
const TYPE_OPTIONS = [
  "metallic",
  "lava",
  "ice",
  "glowing",
  "rocky",
] as const;

const ORBIT_COLORS: Record<string, string> = {
  inner: "text-accent-glow",
  mid: "text-accent-ice",
  deep: "text-accent-purple",
};

const TYPE_DOTS: Record<string, string> = {
  metallic: "bg-gray-300",
  lava: "bg-accent-lava",
  ice: "bg-accent-ice",
  glowing: "bg-accent-glow",
  rocky: "bg-amber-600",
};

// ─── OTP GATE ────────────────────────────────────────────────

function OTPGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const requestOTP = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send code");
      } else {
        setStep("verify");
        setCountdown(60);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Network error");
    }
    setSending(false);
  };

  const code = digits.join("");

  const verifyCode = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        onAuthenticated();
      }
    } catch {
      setError("Network error");
    }
    setVerifying(false);
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      setTimeout(() => {
        const fullCode = next.join("");
        if (fullCode.length === 6) verifyCode();
      }, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && code.length === 6) {
      verifyCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="min-h-screen bg-space relative flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(107,141,181,0.06) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, rgba(199,125,255,0.04) 0%, transparent 50%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md mx-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Terminal-style header bar */}
        <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border border-white/[0.06] border-b-0 rounded-t-2xl">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-lava/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-terminal/60" />
          </div>
          <span className="text-[10px] font-mono text-secondary/30 ml-2">
            admin@ash-teroids ~ /auth
          </span>
        </div>

        {/* Main card */}
        <div className="glass-strong rounded-b-2xl rounded-t-none p-8 pb-10">
          {/* Lock icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-accent-glow/10 border border-accent-glow/20 flex items-center justify-center"
              animate={{ boxShadow: ["0 0 20px rgba(107,141,181,0.1)", "0 0 30px rgba(107,141,181,0.2)", "0 0 20px rgba(107,141,181,0.1)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 text-accent-glow"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
              </svg>
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <p className="text-[10px] font-mono text-accent-glow/70 tracking-[4px] mb-3">
              SECURE_ACCESS
            </p>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Mission Control
            </h1>
            <p className="text-sm text-secondary/70 leading-relaxed">
              {step === "request"
                ? "Authenticate to access the admin panel."
                : "A 6-digit code was transmitted to your inbox."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "request" ? (
              <motion.div
                key="request"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={requestOTP}
                  disabled={sending}
                  className="group w-full relative text-sm font-mono px-6 py-4 rounded-xl bg-accent-glow/10 border border-accent-glow/25 text-accent-glow hover:bg-accent-glow/20 hover:border-accent-glow/40 transition-all disabled:opacity-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {sending ? (
                      <>
                        <Spinner />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                          <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                        </svg>
                        Send access code
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* 6 individual digit inputs */}
                <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-mono bg-white/[0.04] border border-white/10 rounded-xl text-primary outline-none focus:border-accent-glow/50 focus:bg-accent-glow/[0.06] transition-all placeholder-secondary/15"
                      placeholder="·"
                    />
                  ))}
                </div>

                <button
                  onClick={verifyCode}
                  disabled={verifying || code.length !== 6}
                  className="w-full text-sm font-mono px-6 py-3.5 rounded-xl bg-accent-glow/10 border border-accent-glow/25 text-accent-glow hover:bg-accent-glow/20 hover:border-accent-glow/40 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Spinner />
                      Authenticating...
                    </>
                  ) : (
                    "Authenticate"
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-secondary/30">
                    {countdown > 0
                      ? `Resend in ${countdown}s`
                      : ""}
                  </span>
                  <button
                    onClick={() => {
                      requestOTP();
                      setDigits(["", "", "", "", "", ""]);
                    }}
                    disabled={sending || countdown > 0}
                    className="text-[11px] font-mono text-accent-glow/50 hover:text-accent-glow transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Resend code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-lava/10 border border-accent-lava/20"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-accent-lava shrink-0">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 8a.75.75 0 01-1.5 0V4.5a.75.75 0 011.5 0V8z" />
                </svg>
                <span className="text-xs font-mono text-accent-lava/90">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-secondary/25 hover:text-secondary/50 transition-colors"
          >
            <span>&lt;-</span>
            <span>Return to orbit</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [config, setConfig] = useState<AshteroidsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [editingManual, setEditingManual] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/auth/status").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([authData, configData]) => {
      setAuth(authData);
      setAdminAuthed(authData.adminAuthenticated);
      setConfig(configData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (auth?.authenticated) {
      fetch("/api/github")
        .then((r) => r.json())
        .then((data) => {
          if (data.repos) setRepos(data.repos);
        });
    }
  }, [auth]);

  const toggleRepo = useCallback(
    (name: string, enabled: boolean) => {
      if (!config) return;
      setConfig({
        ...config,
        repos: {
          ...config.repos,
          [name]: { ...config.repos[name], enabled },
        },
      });
    },
    [config]
  );

  const updateRepoConfig = useCallback(
    (name: string, updates: Partial<RepoConfig>) => {
      if (!config) return;
      setConfig({
        ...config,
        repos: {
          ...config.repos,
          [name]: { ...config.repos[name], enabled: true, ...updates },
        },
      });
    },
    [config]
  );

  const updateManual = useCallback(
    (index: number, updates: Partial<ManualProject>) => {
      if (!config) return;
      const manualProjects = [...config.manualProjects];
      manualProjects[index] = { ...manualProjects[index], ...updates };
      setConfig({ ...config, manualProjects });
    },
    [config]
  );

  const addManual = useCallback(() => {
    if (!config) return;
    const newProject: ManualProject = {
      slug: "new-project",
      title: "New Project",
      tagline: "",
      description: "",
      techStack: [],
      category: "experiment",
      orbit: "mid",
      asteroidType: "rocky",
      size: 2,
    };
    setConfig({
      ...config,
      manualProjects: [...config.manualProjects, newProject],
    });
    setEditingManual(config.manualProjects.length);
  }, [config]);

  const removeManual = useCallback(
    (index: number) => {
      if (!config) return;
      const manualProjects = config.manualProjects.filter(
        (_, i) => i !== index
      );
      setConfig({ ...config, manualProjects });
      setEditingManual(null);
    },
    [config]
  );

  const handleSave = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveMsg("Config saved!");
      } else {
        const err = await res.json();
        setSaveMsg(`Error: ${err.error}`);
      }
    } catch (e) {
      setSaveMsg(`Error: ${String(e)}`);
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  }, [config]);

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Spinner size="lg" />
          <p className="text-xs font-mono text-secondary/50">
            Initializing mission control...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!adminAuthed) {
    return <OTPGate onAuthenticated={loadData} />;
  }

  const enabledCount = config
    ? Object.values(config.repos).filter((r) => r.enabled).length +
      config.manualProjects.length
    : 0;

  const orbitCounts = config
    ? {
        inner:
          Object.entries(config.repos).filter(
            ([, r]) => r.enabled && r.orbit === "inner"
          ).length +
          config.manualProjects.filter((m) => m.orbit === "inner").length,
        mid:
          Object.entries(config.repos).filter(
            ([, r]) => r.enabled && r.orbit === "mid"
          ).length +
          config.manualProjects.filter((m) => m.orbit === "mid").length,
        deep:
          Object.entries(config.repos).filter(
            ([, r]) => r.enabled && r.orbit === "deep"
          ).length +
          config.manualProjects.filter((m) => m.orbit === "deep").length,
      }
    : { inner: 0, mid: 0, deep: 0 };

  const filteredRepos = searchQuery
    ? repos.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : repos;

  return (
    <div className="min-h-screen bg-space">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(107,141,181,0.05) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent-glow/15 border border-accent-glow/20 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent-glow">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Mission Control
                </h1>
                <p className="text-xs text-secondary/50 font-mono">
                  ash-teroid configuration panel
                </p>
              </div>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-secondary/40 hover:text-secondary transition-colors mt-2 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">
              &lt;-
            </span>
            <span>Back to orbit</span>
          </a>
        </div>

        {/* ── Stats bar ── */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {/* Total */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {enabledCount}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-secondary/40 uppercase tracking-wider">
                  Active
                </p>
                <p className="text-xs text-secondary">ash-teroids</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />

            {/* Orbit breakdown */}
            {(["inner", "mid", "deep"] as const).map((orbit) => (
              <div key={orbit} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    orbit === "inner"
                      ? "bg-accent-glow"
                      : orbit === "mid"
                        ? "bg-accent-ice"
                        : "bg-accent-purple"
                  }`}
                />
                <span className="text-xs font-mono text-secondary/60">
                  <span className="capitalize">{orbit}</span>{" "}
                  <span className="text-primary font-medium">
                    {orbitCounts[orbit]}
                  </span>
                </span>
              </div>
            ))}

            <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />

            {/* GitHub status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  auth?.authenticated ? "bg-terminal" : "bg-accent-lava/60"
                }`}
              />
              {auth?.authenticated ? (
                <div className="flex items-center gap-2">
                  {auth.user?.avatar_url && (
                    <img
                      src={auth.user.avatar_url}
                      alt=""
                      className="w-5 h-5 rounded-full ring-1 ring-white/10"
                    />
                  )}
                  <span className="text-xs font-mono text-secondary/60">
                    {auth.user?.login}
                  </span>
                </div>
              ) : (
                <a
                  href="/api/auth/github"
                  className="text-xs font-mono text-accent-glow/60 hover:text-accent-glow transition-colors"
                >
                  Connect GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── GitHub Repos ── */}
        {auth?.authenticated && (
          <motion.section
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                label="GITHUB REPOSITORIES"
                count={repos.length}
              />
              {/* Search */}
              <div className="relative">
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-secondary/30"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85zm-5.242.156a5 5 0 110-10 5 5 0 010 10z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter repos..."
                  className="w-48 bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-primary outline-none focus:border-accent-glow/30 placeholder-secondary/25 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              {filteredRepos.map((repo) => {
                const rc = config?.repos[repo.name];
                const enabled = rc?.enabled ?? false;
                const expanded = expandedRepo === repo.name;

                return (
                  <motion.div
                    key={repo.name}
                    layout
                    className={`rounded-xl border transition-all duration-200 ${
                      enabled
                        ? "bg-white/[0.04] border-accent-glow/15 shadow-[0_0_15px_rgba(107,141,181,0.04)]"
                        : "bg-white/[0.015] border-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleRepo(repo.name, !enabled)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                          enabled
                            ? "bg-accent-glow/20 border-accent-glow shadow-[0_0_8px_rgba(107,141,181,0.2)]"
                            : "border-white/15 hover:border-white/30"
                        }`}
                      >
                        {enabled && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-accent-glow"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium truncate ${
                              enabled ? "text-primary" : "text-secondary/70"
                            }`}
                          >
                            {repo.name}
                          </span>
                          {repo.private && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-secondary/40 font-mono border border-white/[0.04] shrink-0">
                              PRIVATE
                            </span>
                          )}
                          {repo.language && (
                            <span className="text-[10px] text-secondary/30 font-mono shrink-0">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-secondary/40 truncate mt-0.5">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      {/* Right side badges + expand */}
                      <div className="flex items-center gap-3 shrink-0">
                        {enabled && rc && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.03] ${ORBIT_COLORS[rc.orbit || "mid"]}`}
                            >
                              {rc.orbit || "mid"}
                            </span>
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${TYPE_DOTS[rc.asteroidType || "rocky"]}`}
                            />
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-secondary/25">
                          ★{repo.stargazers_count}
                        </span>
                        {enabled && (
                          <button
                            onClick={() =>
                              setExpandedRepo(expanded ? null : repo.name)
                            }
                            className="w-6 h-6 rounded-md bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                          >
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              className={`w-3 h-3 text-secondary/40 transition-transform ${expanded ? "rotate-180" : ""}`}
                            >
                              <path
                                d="M3 4.5L6 7.5L9 4.5"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded config */}
                    <AnimatePresence>
                      {enabled && expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                              <SelectField
                                label="Orbit"
                                value={rc?.orbit || "mid"}
                                options={ORBIT_OPTIONS}
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    orbit: v as (typeof ORBIT_OPTIONS)[number],
                                  })
                                }
                              />
                              <SelectField
                                label="Category"
                                value={rc?.category || "flagship"}
                                options={CATEGORY_OPTIONS}
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    category:
                                      v as (typeof CATEGORY_OPTIONS)[number],
                                  })
                                }
                              />
                              <SelectField
                                label="Type"
                                value={rc?.asteroidType || "rocky"}
                                options={TYPE_OPTIONS}
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    asteroidType:
                                      v as (typeof TYPE_OPTIONS)[number],
                                  })
                                }
                              />
                              <SelectField
                                label="Size"
                                value={String(rc?.size || 3)}
                                options={["1", "2", "3", "4", "5"]}
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    size: parseInt(v),
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              <TextField
                                label="Title"
                                value={rc?.title || ""}
                                placeholder={repo.name}
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    title: v || undefined,
                                  })
                                }
                              />
                              <TextField
                                label="Tagline"
                                value={rc?.tagline || ""}
                                placeholder={repo.description || ""}
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    tagline: v || undefined,
                                  })
                                }
                              />
                            </div>
                            <div className="mt-3">
                              <TextField
                                label="Description"
                                value={rc?.description || ""}
                                placeholder="Auto-populated from GitHub if empty"
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    description: v || undefined,
                                  })
                                }
                                multiline
                              />
                            </div>
                            <div className="mt-3">
                              <TextField
                                label="Deploy URL"
                                value={rc?.deployUrl || ""}
                                placeholder="https://your-app.vercel.app"
                                onChange={(v) =>
                                  updateRepoConfig(repo.name, {
                                    deployUrl: v || undefined,
                                  })
                                }
                              />
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={rc?.showLink ?? !repo.private}
                                    onChange={(e) =>
                                      updateRepoConfig(repo.name, {
                                        showLink: e.target.checked,
                                      })
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-[18px] rounded-full bg-white/10 peer-checked:bg-accent-glow/30 transition-colors" />
                                  <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-secondary/60 peer-checked:bg-accent-glow peer-checked:translate-x-[14px] transition-all" />
                                </div>
                                <span className="text-xs text-secondary/60 group-hover:text-secondary transition-colors">
                                  Show GitHub link
                                </span>
                              </label>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── Manual Projects ── */}
        <motion.section
          className="mb-24"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeader
              label="MANUAL PROJECTS"
              count={config?.manualProjects.length || 0}
            />
            <button
              onClick={addManual}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-accent-glow/10 border border-accent-glow/15 text-accent-glow hover:bg-accent-glow/20 transition-colors"
            >
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path
                  d="M6 2v8M2 6h8"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
              Add
            </button>
          </div>

          <div className="space-y-1.5">
            {config?.manualProjects.map((project, i) => {
              const editing = editingManual === i;
              return (
                <motion.div
                  key={`${project.slug}-${i}`}
                  layout
                  className="rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary truncate">
                          {project.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.03] ${ORBIT_COLORS[project.orbit]}`}
                        >
                          {project.orbit}
                        </span>
                        <span className="text-[10px] text-secondary/30 font-mono">
                          {project.category}
                        </span>
                      </div>
                      {project.tagline && (
                        <p className="text-xs text-secondary/40 truncate mt-0.5">
                          {project.tagline}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          setEditingManual(editing ? null : i)
                        }
                        className="w-7 h-7 rounded-md bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="w-3 h-3 text-secondary/40"
                        >
                          {editing ? (
                            <path
                              d="M3 4.5L6 7.5L9 4.5"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="rotate-180 origin-center"
                            />
                          ) : (
                            <path
                              d="M8.5 1.5l2 2M1.5 8.5l5.5-5.5 2 2-5.5 5.5H1.5v-2z"
                              stroke="currentColor"
                              strokeWidth={1}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() => removeManual(i)}
                        className="w-7 h-7 rounded-md bg-white/[0.03] hover:bg-accent-lava/10 flex items-center justify-center transition-colors group"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="w-3 h-3 text-secondary/30 group-hover:text-accent-lava transition-colors"
                        >
                          <path
                            d="M2.5 3h7M4.5 3V2h3v1M3.5 3v6.5a1 1 0 001 1h3a1 1 0 001-1V3"
                            stroke="currentColor"
                            strokeWidth={1}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
                          <div className="grid grid-cols-2 gap-3">
                            <TextField
                              label="Slug"
                              value={project.slug}
                              onChange={(v) => updateManual(i, { slug: v })}
                            />
                            <TextField
                              label="Title"
                              value={project.title}
                              onChange={(v) => updateManual(i, { title: v })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <TextField
                              label="Tagline"
                              value={project.tagline}
                              onChange={(v) =>
                                updateManual(i, { tagline: v })
                              }
                            />
                            <TextField
                              label="Tech (comma-separated)"
                              value={project.techStack.join(", ")}
                              onChange={(v) =>
                                updateManual(i, {
                                  techStack: v
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                            />
                          </div>
                          <div className="mt-3">
                            <TextField
                              label="Description"
                              value={project.description}
                              onChange={(v) =>
                                updateManual(i, { description: v })
                              }
                              multiline
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <SelectField
                              label="Orbit"
                              value={project.orbit}
                              options={ORBIT_OPTIONS}
                              onChange={(v) =>
                                updateManual(i, {
                                  orbit: v as (typeof ORBIT_OPTIONS)[number],
                                })
                              }
                            />
                            <SelectField
                              label="Category"
                              value={project.category}
                              options={CATEGORY_OPTIONS}
                              onChange={(v) =>
                                updateManual(i, {
                                  category:
                                    v as (typeof CATEGORY_OPTIONS)[number],
                                })
                              }
                            />
                            <SelectField
                              label="Type"
                              value={project.asteroidType}
                              options={TYPE_OPTIONS}
                              onChange={(v) =>
                                updateManual(i, {
                                  asteroidType:
                                    v as (typeof TYPE_OPTIONS)[number],
                                })
                              }
                            />
                            <SelectField
                              label="Size"
                              value={String(project.size)}
                              options={["1", "2", "3", "4", "5"]}
                              onChange={(v) =>
                                updateManual(i, { size: parseInt(v) })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <TextField
                              label="Year"
                              value={project.year || ""}
                              onChange={(v) =>
                                updateManual(i, { year: v || undefined })
                              }
                              placeholder="e.g. 2024"
                            />
                            <TextField
                              label="Deploy URL"
                              value={project.deployUrl || ""}
                              onChange={(v) =>
                                updateManual(i, {
                                  deployUrl: v || undefined,
                                })
                              }
                              placeholder="https://your-app.vercel.app"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Sticky save bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-5xl mx-auto px-6 pb-6">
            <motion.div
              className="glass-strong rounded-xl px-5 py-3.5 flex items-center justify-between shadow-[0_-4px_30px_rgba(0,0,0,0.4)]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 text-xs font-mono">
                <AnimatePresence mode="wait">
                  {saveMsg ? (
                    <motion.div
                      key="msg"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      {saveMsg.startsWith("Error") ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-lava" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-terminal" />
                      )}
                      <span
                        className={
                          saveMsg.startsWith("Error")
                            ? "text-accent-lava"
                            : "text-terminal"
                        }
                      >
                        {saveMsg}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-secondary/30"
                    >
                      Unsaved changes are local only
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-mono px-5 py-2 rounded-lg bg-accent-glow/15 border border-accent-glow/25 text-accent-glow hover:bg-accent-glow/25 hover:border-accent-glow/40 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm11.78-1.72a.75.75 0 00-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" />
                    </svg>
                    Deploy config
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────

function SectionHeader({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-[10px] font-mono text-secondary/40 tracking-[2px]">
        {label}
      </h2>
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-secondary/40">
        {count}
      </span>
    </div>
  );
}

function Spinner({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls =
    size === "lg" ? "w-5 h-5 border-2" : "w-3.5 h-3.5 border-[1.5px]";
  return (
    <div
      className={`${cls} rounded-full border-accent-glow/30 border-t-accent-glow animate-spin`}
    />
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-secondary/30 mb-1.5 tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent-glow/30 transition-colors appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236b8db5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          backgroundSize: "12px",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0a0820]">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent-glow/30 placeholder-secondary/20 transition-colors";

  return (
    <div>
      <label className="block text-[10px] font-mono text-secondary/30 mb-1.5 tracking-wider">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
