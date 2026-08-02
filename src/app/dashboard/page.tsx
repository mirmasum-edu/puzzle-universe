"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { SkeletonCard } from "@/components/ui";
import { GAMES } from "@/lib/games";

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
      push(`Claimed ${r.reward} 🪙 + ${r.gems} 💠! Streak ${r.streak} days 🔥`, "success");
      refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : "Failed to claim daily reward", "error");
    } finally {
      setClaiming(false);
    }
  }

  const winRate = me && me.gamesPlayed > 0 ? Math.round((me.wins / me.gamesPlayed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome + XP Bar banner */}
      <div className="glass-strong rounded-2xl p-6 animate-fade-up relative overflow-hidden">
        {/* Abstract background gradient details */}
        <div className="absolute top-[-50px] right-[-50px] w-48 h-44 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-50px] w-48 h-44 rounded-full bg-fuchsia-500/20 blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {me?.username} {me?.avatar}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Level {me?.level} · {me?.xp.toLocaleString()} XP · Progress to next level by solving puzzles and clearing lines!
            </p>
          </div>
          <Link
            href="/dashboard/play"
            className="rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            🎮 Play Now
          </Link>
        </div>
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-xs text-white/50 mb-1.5 font-bold">
            <span>Level {me?.level}</span>
            <span>
              {me?.xpInto.toLocaleString()} / {me?.xpNeeded.toLocaleString()} XP ({me ? Math.round((me.xpInto / me.xpNeeded) * 100) : 0}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 transition-all duration-500"
              style={{ width: `${me ? Math.min(100, (me.xpInto / me.xpNeeded) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="⭐" label="High Score" value={me?.highScore.toLocaleString() ?? "0"} />
        <StatCard icon="🎮" label="Games Played" value={me?.gamesPlayed ?? 0} />
        <StatCard icon="🏅" label="Win Rate" value={`${winRate}%`} />
        <StatCard icon="🔥" label="Best Combo" value={`${me?.bestCombo ?? 0}x`} />
      </div>

      {/* NEW ADVANCED UI/UX FEATURE: Quick Play Arcade (Direct Links to all 11 games) */}
      <div className="glass rounded-2xl p-5 sm:p-6 animate-fade-up space-y-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🕹️ Quick Play Arcade
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Jump straight into any of the 11 uniquely-solvable puzzle games on the platform.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/dashboard/play/${game.slug}`}
              className={`rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-lg hover:shadow-violet-500/5 group`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-2.5 transition duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-md`}
              >
                {game.icon}
              </div>
              <h3 className="font-extrabold text-xs text-white line-clamp-1 group-hover:text-violet-300 transition duration-150">
                {game.title}
              </h3>
              <p className="text-[10px] text-white/40 mt-1 truncate w-full">
                {game.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom widgets columns grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily + Missions */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 animate-fade-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-white">📅 Daily Reward</h2>
              <span className="text-xs rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-bold">
                🔥 Streak {me?.streak}d
              </span>
            </div>
            <p className="text-xs text-white/50 mb-3.5 leading-relaxed">
              Claim your daily bonus rewards and grow your login streak to claim larger amounts of free Coins and Gems.
            </p>
            <button
              onClick={claimDaily}
              disabled={claiming}
              className="w-full rounded-xl bg-emerald-500/90 hover:bg-emerald-500 py-2.5 font-bold text-white transition disabled:opacity-50 active:scale-95 shadow-md shadow-emerald-500/20"
            >
              {claiming ? "Claiming…" : "Claim Daily Reward"}
            </button>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">🎯 Missions Progress</h2>
              <Link href="/dashboard/missions" className="text-xs text-violet-300 font-semibold hover:underline">
                View all
              </Link>
            </div>
            {!missions ? (
              <div className="space-y-2">
                <SkeletonCard />
              </div>
            ) : missions.length === 0 ? (
              <p className="text-xs text-white/40 py-4 text-center">No missions available</p>
            ) : (
              <div className="space-y-3">
                {missions.slice(0, 4).map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white/80">{m.title}</span>
                      <span className="text-white/40">
                        {Math.min(m.progress, m.target).toLocaleString()} / {m.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${m.completed ? "bg-emerald-400" : "bg-violet-400"}`}
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
        <div className="glass rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">🏆 Global Leaderboard</h2>
            <Link href="/dashboard/leaderboard" className="text-xs text-violet-300 font-semibold hover:underline">
              View all
            </Link>
          </div>
          {!lb ? (
            <SkeletonCard />
          ) : lb.length === 0 ? (
            <p className="text-xs text-white/40 py-4 text-center">No scores submitted yet</p>
          ) : (
            <div className="space-y-1.5">
              {lb.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs border ${
                    r.me
                      ? "bg-violet-500/20 border-violet-400/30 text-white font-bold"
                      : "bg-white/5 border-white/[0.02]"
                  }`}
                >
                  <span className="w-6 text-white/40 font-bold">#{r.rank}</span>
                  <span className="text-base">{r.avatar}</span>
                  <span className="flex-1 truncate text-white">{r.username}</span>
                  <span className="font-semibold text-violet-300">{r.highScore.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live events */}
        <div className="glass rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">🎉 Live & Upcoming Events</h2>
            <Link href="/dashboard/events" className="text-xs text-violet-300 font-semibold hover:underline">
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
                  <div key={e.id} className="rounded-xl bg-white/5 border border-white/[0.02] px-3.5 py-3 flex gap-3 items-start animate-fade-up">
                    <span className="text-2xl mt-0.5">{e.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">{e.title}</span>
                        <span className="text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 animate-pulse">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{e.description}</p>
                    </div>
                  </div>
                ))}
              {events.filter((e) => e.status === "live").length === 0 && (
                <p className="text-xs text-white/40 py-4 text-center">No live events today</p>
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
    <div className="glass rounded-2xl p-4 animate-fade-up flex items-center gap-3 relative overflow-hidden border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-200">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider leading-none mb-1">
          {label}
        </div>
        <div className="text-lg font-black text-white leading-none">{value}</div>
      </div>
    </div>
  );
}
