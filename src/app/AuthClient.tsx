"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/client";
import { ToastProvider, useToast } from "@/components/Toast";
import { Field, inputCls } from "@/components/ui";

const COUNTRIES = ["US", "UK", "CA", "AU", "DE", "IN", "BD", "ID", "BR", "PH"];

// Shared seed promise so login flows can wait for demo data to exist.
let seedPromise: Promise<unknown> | null = null;

function AuthInner() {
  const { push } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    country: "US",
  });

  // Kick off seeding so demo accounts exist. We keep a promise so login can await it.
  useEffect(() => {
    seedPromise = api("/api/seed", { method: "POST" }).catch(() => {});
    seedPromise.finally(() => setSeeding(false));
  }, []);

  // Perform login/registration then hard-navigate so the server re-reads the cookie.
  async function performAuth(kind: "login" | "register", payload: Record<string, string>) {
    // Ensure the demo world is seeded before attempting to log in.
    if (seedPromise) {
      try {
        await seedPromise;
      } catch {
        /* ignore seed errors */
      }
    }
    if (kind === "login") {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      });
    } else {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
    }
    push("Welcome to Puzzle Universe!", "success");
    // Honor a same-origin redirect target (set by middleware), else go to dashboard.
    let target = "/dashboard";
    try {
      const param = new URLSearchParams(window.location.search).get("redirect");
      if (param && param.startsWith("/") && !param.startsWith("//")) target = param;
    } catch {
      /* ignore */
    }
    // Hard navigation guarantees the protected layout reads the new session cookie.
    window.location.assign(target);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await performAuth(mode, form);
    } catch (err) {
      push(err instanceof Error ? err.message : "Something went wrong", "error");
      setLoading(false);
    }
  }

  // One-click quick login for demo accounts.
  async function quickLogin(email: string) {
    setMode("login");
    setForm((f) => ({ ...f, email, password: "password123" }));
    setLoading(true);
    try {
      await performAuth("login", { email, password: "password123" });
    } catch (err) {
      push(err instanceof Error ? err.message : "Login failed", "error");
      setLoading(false);
    }
  }

  return (
    <main className="pu-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Hero */}
        <div className="hidden md:block animate-fade-up">
          <div className="text-6xl mb-4">🧩</div>
          <h1 className="text-5xl font-black tracking-tight leading-tight">
            Puzzle{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              Universe
            </span>
          </h1>
          <p className="mt-4 text-white/60 text-lg max-w-md">
            A polished puzzle platform for everyone, age 4 and up. Play the Grid
            Block Puzzle, climb global leaderboards, unlock 30+ achievements and
            complete daily missions.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
            {[
              ["🎮", "Playable Grid Puzzle"],
              ["🏆", "Global Leaderboards"],
              ["🎯", "Daily Missions"],
              ["🛍️", "Cosmetic Shop"],
            ].map(([i, t]) => (
              <div key={t} className="glass rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <span className="text-xl">{i}</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-3xl p-8 animate-fade-up shadow-2xl">
          <div className="md:hidden text-center mb-6">
            <div className="text-4xl">🧩</div>
            <h1 className="text-2xl font-black">Puzzle Universe</h1>
          </div>

          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  mode === m ? "bg-violet-500 text-white" : "text-white/60"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <Field label="Username">
                <input
                  className={inputCls}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="PuzzleFan"
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </Field>
            {mode === "register" && (
              <Field label="Country">
                <select
                  className={inputCls}
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <p className="text-center text-xs text-white/40">
              {seeding ? "Preparing demo world…" : "Quick demo access:"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => quickLogin("demo@puzzle.dev")}
                className="rounded-xl bg-white/5 hover:bg-white/10 py-2 text-xs font-medium disabled:opacity-50"
              >
                🦊 Demo Player
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => quickLogin("admin@puzzle.dev")}
                className="rounded-xl bg-white/5 hover:bg-white/10 py-2 text-xs font-medium disabled:opacity-50"
              >
                👑 Admin
              </button>
            </div>
            <p className="text-center text-[11px] text-white/30">
              Password for demo accounts: password123
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthClient() {
  return (
    <ToastProvider>
      <AuthInner />
    </ToastProvider>
  );
}
