"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { SkeletonCard } from "@/components/ui";

type LB = { id: number; username: string; avatar: string; highScore: number; rank: number; me: boolean };
type Mission = { id: number; title: string; type: string; progress: number; target: number; completed: boolean };
type EventItem = { id: number; title: string; icon: string; status: string; description: string };

export default function DashboardPage() {
  const { me, refresh } = useUser();
  const { push } = useToast();
  const [lb, setLb] = useState<LB[] | null>(null);
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    api<{ leaderboard: LB[] }>("/api/leaderboard").then((d) => setLb(d.leaderboard)).catch(() => setLb([]));
    api<{ items: Mission[] }>("/api/missions").then((d) => setMissions(d.items)).catch(() => setMissions([]));
    api<{ items: EventItem[] }>("/api/events").then((d) => setEvents(d.items)).catch(() => setEvents([]));
  }, []);

  async function claimDaily() {
    setClaiming(true);
    try {
      const r = await api<{ reward: number; gems: number; streak: number }>("/api/daily", { method: "POST" });
      push(`Claimed ${r.reward} 🪙 + ${r.gems} 💠! Streak ${r.streak} 🔥`, "success");
      refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setClaiming(false);
    }
  }

  const winRate = me && me.gamesPlayed > 0 ? Math.round((me.wins / me.gamesPlayed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome + XP */}
      <div className="glass-strong rounded-2xl p-6 animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">
              Welcome back, {me?.username} {me?.avatar}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Level {me?.level} · {me?.xp.toLocaleString()} XP · Rank up by clearing lines!
            </p>
          </div>
          <Link
            href="/dashboard/play"
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold shadow-lg"
          >
            🎮 Play Now
          </Link>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Level {me?.level}</span>
            <span>
              {me?.xpInto} / {me?.xpNeeded} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
              style={{ width: `${me ? Math.min(100, (me.xpInto / me.xpNeeded) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="⭐" label="High Score" value={me?.highScore.toLocaleString() ?? "0"} />
        <StatCard icon="🎮" label="Games Played" value={me?.gamesPlayed ?? 0} />
        <StatCard icon="🏅" label="Win Rate" value={`${winRate}%`} />
        <StatCard icon="🔥" label="Best Combo" value={`${me?.bestCombo ?? 0}x`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily + Missions */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">📅 Daily Reward</h2>
              <span className="text-xs text-white/50">Streak {me?.streak} days</span>
            </div>
            <p className="text-sm text-white/50 mb-3">
              Claim your daily bonus and grow your streak for bigger rewards.
            </p>
            <button
              onClick={claimDaily}
              disabled={claiming}
              className="w-full rounded-xl bg-emerald-500/90 hover:bg-emerald-500 py-2.5 font-semibold disabled:opacity-50"
            >
              {claiming ? "Claiming…" : "Claim Daily Reward"}
            </button>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">🎯 Missions</h2>
              <Link href="/dashboard/missions" className="text-xs text-violet-300">
                View all
              </Link>
            </div>
            {!missions ? (
              <div className="space-y-2">
                <SkeletonCard />
              </div>
            ) : missions.length === 0 ? (
              <p className="text-sm text-white/40 py-4 text-center">No missions</p>
            ) : (
              <div className="space-y-3">
                {missions.slice(0, 4).map((m) => (
                  <div key={m.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m.title}</span>
                      <span className="text-white/40">
                        {Math.min(m.progress, m.target)}/{m.target}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${m.completed ? "bg-emerald-400" : "bg-violet-400"}`}
                        style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard preview */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🏆 Leaderboard</h2>
            <Link href="/dashboard/leaderboard" className="text-xs text-violet-300">
              View all
            </Link>
          </div>
          {!lb ? (
            <SkeletonCard />
          ) : lb.length === 0 ? (
            <p className="text-sm text-white/40 py-4 text-center">No scores yet</p>
          ) : (
            <div className="space-y-1.5">
              {lb.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    r.me ? "bg-violet-500/20" : "bg-white/5"
                  }`}
                >
                  <span className="w-6 text-white/50">#{r.rank}</span>
                  <span className="text-lg">{r.avatar}</span>
                  <span className="flex-1 truncate">{r.username}</span>
                  <span className="font-semibold">{r.highScore.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live events */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🎉 Live Events</h2>
            <Link href="/dashboard/events" className="text-xs text-violet-300">
              View all
            </Link>
          </div>
          {!events ? (
            <SkeletonCard />
          ) : (
            <div className="space-y-2">
              {events
                .filter((e) => e.status === "live")
                .slice(0, 4)
                .map((e) => (
                  <div key={e.id} className="rounded-xl bg-white/5 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{e.icon}</span>
                      <span className="font-medium text-sm">{e.title}</span>
                      <span className="ml-auto text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5">
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1">{e.description}</p>
                  </div>
                ))}
              {events.filter((e) => e.status === "live").length === 0 && (
                <p className="text-sm text-white/40 py-4 text-center">No live events</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-4 animate-fade-up">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
