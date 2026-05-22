"use client";
import { useState, useEffect, useCallback } from "react";
import type { AshteroidsConfig, RepoConfig, ManualProject } from "@/data/projects";
import type { GitHubRepo } from "@/lib/projects";

type AuthStatus = {
  authenticated: boolean;
  user?: { login: string; avatar_url: string; name: string };
};

const ORBIT_OPTIONS = ["inner", "mid", "deep"] as const;
const CATEGORY_OPTIONS = ["flagship", "startup", "infra", "experiment", "thought"] as const;
const TYPE_OPTIONS = ["metallic", "lava", "ice", "glowing", "rocky"] as const;

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [config, setConfig] = useState<AshteroidsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [editingManual, setEditingManual] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/status").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([authData, configData]) => {
      setAuth(authData);
      setConfig(configData);
      setLoading(false);
    });
  }, []);

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
      const manualProjects = config.manualProjects.filter((_, i) => i !== index);
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
    setTimeout(() => setSaveMsg(""), 3000);
  }, [config]);

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <p className="text-sm font-mono text-secondary animate-pulse">
          Loading admin...
        </p>
      </div>
    );
  }

  const enabledCount = config
    ? Object.values(config.repos).filter((r) => r.enabled).length +
      config.manualProjects.length
    : 0;

  const orbitCounts = config
    ? {
        inner: Object.entries(config.repos)
          .filter(([, r]) => r.enabled && r.orbit === "inner")
          .length +
          config.manualProjects.filter((m) => m.orbit === "inner").length,
        mid: Object.entries(config.repos)
          .filter(([, r]) => r.enabled && r.orbit === "mid")
          .length +
          config.manualProjects.filter((m) => m.orbit === "mid").length,
        deep: Object.entries(config.repos)
          .filter(([, r]) => r.enabled && r.orbit === "deep")
          .length +
          config.manualProjects.filter((m) => m.orbit === "deep").length,
      }
    : { inner: 0, mid: 0, deep: 0 };

  return (
    <div className="min-h-screen bg-space">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Ash-teroid Manager
            </h1>
            <p className="text-sm text-secondary mt-1">
              Configure which projects orbit your portfolio
            </p>
          </div>
          <a
            href="/"
            className="text-xs font-mono text-secondary hover:text-primary transition-colors"
          >
            &lt;- Back to site
          </a>
        </div>

        {/* Auth status */}
        <div className="glass rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${auth?.authenticated ? "bg-green-400" : "bg-red-400"}`}
              />
              {auth?.authenticated ? (
                <div className="flex items-center gap-3">
                  {auth.user?.avatar_url && (
                    <img
                      src={auth.user.avatar_url}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-primary">
                    Connected as{" "}
                    <span className="font-mono text-accent-glow">
                      {auth.user?.login}
                    </span>
                  </span>
                </div>
              ) : (
                <span className="text-sm text-secondary">
                  Not connected to GitHub
                </span>
              )}
            </div>
            {!auth?.authenticated && (
              <a
                href="/api/auth/github"
                className="text-sm font-mono px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-accent-glow hover:bg-white/10 transition-colors"
              >
                Connect GitHub
              </a>
            )}
          </div>
        </div>

        {/* Preview bar */}
        <div className="glass rounded-xl p-4 mb-6 flex items-center gap-6">
          <div className="text-xs font-mono text-secondary">
            FIELD PREVIEW
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-primary">
              {enabledCount} ash-teroids
            </span>
            <span className="text-secondary/40">|</span>
            <span className="text-accent-glow">
              Inner: {orbitCounts.inner}
            </span>
            <span className="text-accent-ice">
              Mid: {orbitCounts.mid}
            </span>
            <span className="text-secondary">
              Deep: {orbitCounts.deep}
            </span>
          </div>
        </div>

        {/* GitHub Repos */}
        {auth?.authenticated && (
          <section className="mb-8">
            <h2 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
              GITHUB REPOS ({repos.length})
            </h2>
            <div className="space-y-2">
              {repos.map((repo) => {
                const rc = config?.repos[repo.name];
                const enabled = rc?.enabled ?? false;
                const expanded = expandedRepo === repo.name;

                return (
                  <div
                    key={repo.name}
                    className={`rounded-xl border transition-colors ${
                      enabled
                        ? "bg-white/5 border-accent-glow/20"
                        : "bg-white/2 border-white/5"
                    }`}
                  >
                    {/* Row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => toggleRepo(repo.name, !enabled)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          enabled
                            ? "bg-accent-glow/20 border-accent-glow"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {enabled && (
                          <span className="text-accent-glow text-xs">
                            ✓
                          </span>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary truncate">
                            {repo.name}
                          </span>
                          {repo.private && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-secondary/60 font-mono shrink-0">
                              PRIVATE
                            </span>
                          )}
                          {repo.language && (
                            <span className="text-[10px] text-secondary/40 font-mono shrink-0">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-secondary/60 truncate mt-0.5">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-secondary/40">
                          ★{repo.stargazers_count}
                        </span>
                        {enabled && (
                          <button
                            onClick={() =>
                              setExpandedRepo(expanded ? null : repo.name)
                            }
                            className="text-xs font-mono text-secondary/40 hover:text-secondary transition-colors"
                          >
                            {expanded ? "▲" : "▼"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded config */}
                    {enabled && expanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-white/5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <SelectField
                            label="Orbit"
                            value={rc?.orbit || "mid"}
                            options={ORBIT_OPTIONS}
                            onChange={(v) =>
                              updateRepoConfig(repo.name, {
                                orbit: v as typeof ORBIT_OPTIONS[number],
                              })
                            }
                          />
                          <SelectField
                            label="Category"
                            value={rc?.category || "flagship"}
                            options={CATEGORY_OPTIONS}
                            onChange={(v) =>
                              updateRepoConfig(repo.name, {
                                category: v as typeof CATEGORY_OPTIONS[number],
                              })
                            }
                          />
                          <SelectField
                            label="Type"
                            value={rc?.asteroidType || "rocky"}
                            options={TYPE_OPTIONS}
                            onChange={(v) =>
                              updateRepoConfig(repo.name, {
                                asteroidType: v as typeof TYPE_OPTIONS[number],
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
                              updateRepoConfig(repo.name, { title: v || undefined })
                            }
                          />
                          <TextField
                            label="Tagline"
                            value={rc?.tagline || ""}
                            placeholder={repo.description || ""}
                            onChange={(v) =>
                              updateRepoConfig(repo.name, { tagline: v || undefined })
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
                        <div className="mt-3 flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rc?.showLink ?? !repo.private}
                              onChange={(e) =>
                                updateRepoConfig(repo.name, {
                                  showLink: e.target.checked,
                                })
                              }
                              className="accent-accent-glow"
                            />
                            <span className="text-xs text-secondary">
                              Show GitHub link on site
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Manual Projects */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono text-secondary/50 tracking-wider">
              MANUAL PROJECTS ({config?.manualProjects.length || 0})
            </h2>
            <button
              onClick={addManual}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-accent-glow hover:bg-white/10 transition-colors"
            >
              + Add project
            </button>
          </div>
          <div className="space-y-2">
            {config?.manualProjects.map((project, i) => {
              const editing = editingManual === i;
              return (
                <div
                  key={`${project.slug}-${i}`}
                  className="rounded-xl bg-white/3 border border-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-primary">
                        {project.title}
                      </span>
                      <span className="text-xs text-secondary/40 ml-2 font-mono">
                        {project.orbit} · {project.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingManual(editing ? null : i)}
                        className="text-xs font-mono text-secondary/40 hover:text-secondary transition-colors"
                      >
                        {editing ? "▲" : "Edit"}
                      </button>
                      <button
                        onClick={() => removeManual(i)}
                        className="text-xs font-mono text-accent-lava/60 hover:text-accent-lava transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-4 border-t border-white/5 pt-4">
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
                          onChange={(v) => updateManual(i, { tagline: v })}
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
                          onChange={(v) => updateManual(i, { description: v })}
                          multiline
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <SelectField
                          label="Orbit"
                          value={project.orbit}
                          options={ORBIT_OPTIONS}
                          onChange={(v) =>
                            updateManual(i, { orbit: v as typeof ORBIT_OPTIONS[number] })
                          }
                        />
                        <SelectField
                          label="Category"
                          value={project.category}
                          options={CATEGORY_OPTIONS}
                          onChange={(v) =>
                            updateManual(i, {
                              category: v as typeof CATEGORY_OPTIONS[number],
                            })
                          }
                        />
                        <SelectField
                          label="Type"
                          value={project.asteroidType}
                          options={TYPE_OPTIONS}
                          onChange={(v) =>
                            updateManual(i, {
                              asteroidType: v as typeof TYPE_OPTIONS[number],
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
                      <div className="mt-3">
                        <TextField
                          label="Year"
                          value={project.year || ""}
                          onChange={(v) => updateManual(i, { year: v || undefined })}
                          placeholder="e.g. 2024"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Save bar */}
        <div className="sticky bottom-0 glass-strong rounded-xl p-4 flex items-center justify-between">
          <div className="text-xs font-mono">
            {saveMsg ? (
              <span
                className={
                  saveMsg.startsWith("Error")
                    ? "text-accent-lava"
                    : "text-terminal"
                }
              >
                {saveMsg}
              </span>
            ) : (
              <span className="text-secondary/40">
                Changes are local until you save
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-mono px-6 py-2 rounded-lg bg-accent-glow/20 border border-accent-glow/30 text-accent-glow hover:bg-accent-glow/30 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Config"}
          </button>
        </div>
      </div>
    </div>
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
      <label className="block text-[10px] font-mono text-secondary/40 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary outline-none focus:border-accent-glow/30"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-space">
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
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary outline-none focus:border-accent-glow/30 placeholder-secondary/30";

  return (
    <div>
      <label className="block text-[10px] font-mono text-secondary/40 mb-1">
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
