"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useUser } from "@/components/UserContext";
import { Skeleton, EmptyState } from "@/components/ui";

type Stats = {
  users: number;
  scores: number;
  achievements: number;
  missions: number;
  shopItems: number;
  events: number;
  totalScore: number;
};

export default function AdminPage() {
  const { me } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    api<{ stats: Stats }>("/api/admin/stats")
      .then((d) => setStats(d.stats))
      .catch(() => setForbidden(true));
  }, []);

  if (me && me.role !== "admin") {
    return (
      <EmptyState
        icon="🔒"
        title="Admins only"
        message="You don't have permission to view the admin dashboard. Log in with the admin demo account."
      />
    );
  }

  const cards = [
    { label: "Users", icon: "👥", key: "users" as const, href: "/dashboard/leaderboard" },
    { label: "Achievements", icon: "🎖️", key: "achievements" as const, href: "/dashboard/achievements" },
    { label: "Missions", icon: "🎯", key: "missions" as const, href: "/dashboard/missions" },
    { label: "Shop Items", icon: "🛍️", key: "shopItems" as const, href: "/dashboard/shop" },
    { label: "Events", icon: "🎉", key: "events" as const, href: "/dashboard/events" },
    { label: "Scores Logged", icon: "⭐", key: "scores" as const, href: "/dashboard/leaderboard" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">🛠️ Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Platform overview and content management.</p>
      </div>

      {forbidden ? (
        <EmptyState icon="🔒" title="Forbidden" message="Admin access required." />
      ) : !stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="glass-strong rounded-2xl p-6 flex flex-wrap gap-6 items-center animate-fade-up">
            <div>
              <div className="text-xs text-white/50">Total Score Across Platform</div>
              <div className="text-3xl font-black">{stats.totalScore.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-white/50">Registered Players</div>
              <div className="text-3xl font-black">{stats.users}</div>
            </div>
            <div>
              <div className="text-xs text-white/50">Games Recorded</div>
              <div className="text-3xl font-black">{stats.scores}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="glass rounded-2xl p-5 hover:bg-white/10 transition animate-fade-up"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-3xl font-black">{stats[c.key]}</span>
                </div>
                <div className="text-sm text-white/60 mt-2">{c.label}</div>
                <div className="text-xs text-violet-300 mt-1">Manage →</div>
              </Link>
            ))}
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold mb-2">Quick Management</h2>
            <p className="text-sm text-white/50 mb-3">
              Use the sidebar or the cards above to create, edit, and delete achievements, missions, shop items, and
              events. All changes are persisted to the database with optimistic UI updates.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/achievements" className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm">
                🎖️ Achievements
              </Link>
              <Link href="/dashboard/missions" className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm">
                🎯 Missions
              </Link>
              <Link href="/dashboard/shop" className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm">
                🛍️ Shop
              </Link>
              <Link href="/dashboard/events" className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm">
                🎉 Events
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
