"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Skeleton, EmptyState, Field, inputCls } from "@/components/ui";

type Score = { id: number; score: number; lines: number; combo: number; mode: string; createdAt: string };

const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐳", "🦉", "🐝", "🐰", "🐨", "🐯"];
const COUNTRIES = ["US", "UK", "CA", "AU", "DE", "IN", "BD", "ID", "BR", "PH"];

export default function ProfilePage() {
  const { me, refresh } = useUser();
  const { push } = useToast();
  const [scores, setScores] = useState<Score[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", country: "US", avatar: "🦊" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ scores: Score[] }>("/api/scores").then((d) => setScores(d.scores)).catch(() => setScores([]));
  }, []);

  useEffect(() => {
    if (me) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ username: me.username, country: me.country, avatar: me.avatar });
    }
  }, [me]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/profile", { method: "PATCH", body: JSON.stringify(form) });
      push("Profile updated", "success");
      setEditing(false);
      refresh();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!me) return null;
  const winRate = me.gamesPlayed > 0 ? Math.round((me.wins / me.gamesPlayed) * 100) : 0;
  const avgScore = scores && scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-6 animate-fade-up">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-6xl">{me.avatar}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-black">{me.username}</h1>
            <p className="text-white/50 text-sm">
              {me.email} · {me.country} · Level {me.level}
              {me.role === "admin" && <span className="ml-2 rounded-full bg-amber-400/20 text-amber-300 px-2 py-0.5 text-xs">Admin</span>}
            </p>
            <div className="mt-2 h-2 rounded-full bg-white/10 max-w-xs">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                style={{ width: `${Math.min(100, (me.xpInto / me.xpNeeded) * 100)}%` }}
              />
            </div>
          </div>
          <button onClick={() => setEditing((e) => !e)} className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium">
            {editing ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        {editing && (
          <form onSubmit={save} className="mt-6 grid sm:grid-cols-2 gap-4 animate-fade-up">
            <Field label="Username">
              <input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Field>
            <Field label="Country">
              <select className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <span className="text-xs font-medium text-white/60 mb-2 block">Avatar</span>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setForm({ ...form, avatar: a })}
                    className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center ${
                      form.avatar === a ? "bg-violet-500 ring-2 ring-violet-300" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-semibold disabled:opacity-50">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon="⭐" label="High Score" value={me.highScore.toLocaleString()} />
        <Stat icon="🎮" label="Games" value={me.gamesPlayed} />
        <Stat icon="🏆" label="Wins" value={me.wins} />
        <Stat icon="🏅" label="Win Rate" value={`${winRate}%`} />
        <Stat icon="🔥" label="Best Combo" value={`${me.bestCombo}x`} />
        <Stat icon="📅" label="Streak" value={`${me.streak}d`} />
        <Stat icon="📊" label="Avg Score" value={avgScore.toLocaleString()} />
        <Stat icon="💠" label="Gems" value={me.gems} />
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold mb-3">📜 Recent Games</h2>
        {!scores ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <EmptyState icon="🎮" title="No games yet" message="Play the Grid Block Puzzle to see your history here." />
        ) : (
          <div className="space-y-1.5">
            {scores.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize">{s.mode}</span>
                <span className="font-semibold">{s.score.toLocaleString()}</span>
                <span className="text-white/40 text-xs">🧹 {s.lines}</span>
                <span className="text-white/40 text-xs">⚡ {s.combo}x</span>
                <span className="ml-auto text-white/30 text-xs">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
