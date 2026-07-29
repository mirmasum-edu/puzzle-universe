"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Skeleton, EmptyState } from "@/components/ui";

type LB = {
  id: number;
  username: string;
  avatar: string;
  country: string;
  highScore: number;
  level: number;
  rank: number;
  me: boolean;
};

const SCOPES = ["Global", "Weekly", "Monthly", "All Time"];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LB[] | null>(null);
  const [scope, setScope] = useState("Global");
  const [q, setQ] = useState("");

  useEffect(() => {
    api<{ leaderboard: LB[] }>("/api/leaderboard")
      .then((d) => setRows(d.leaderboard))
      .catch(() => setRows([]));
  }, []);

  const filtered = rows?.filter((r) => r.username.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">🏆 Leaderboard</h1>
          <p className="text-white/50 text-sm mt-1">Compete with players worldwide.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search players…"
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {SCOPES.map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              scope === s ? "bg-violet-500" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {!rows ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState icon="🏆" title="No players found" message="Try adjusting your search." />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 ${
                r.me ? "bg-violet-500/15" : "hover:bg-white/5"
              }`}
            >
              <span
                className={`w-9 text-center font-bold ${
                  r.rank === 1
                    ? "text-amber-300"
                    : r.rank === 2
                    ? "text-slate-300"
                    : r.rank === 3
                    ? "text-orange-400"
                    : "text-white/40"
                }`}
              >
                {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : `#${r.rank}`}
              </span>
              <span className="text-2xl">{r.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {r.username} {r.me && <span className="text-xs text-violet-300">(you)</span>}
                </p>
                <p className="text-xs text-white/40">
                  {r.country} · Lvl {r.level}
                </p>
              </div>
              <span className="font-bold">{r.highScore.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
