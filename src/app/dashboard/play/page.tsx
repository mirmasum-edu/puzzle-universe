"use client";

import Link from "next/link";
import { GAMES } from "@/lib/games";

export default function PlayHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">🎮 Game Arcade</h1>
        <p className="text-white/50 text-sm mt-1">
          Six complete puzzle games — pick one and play. Every game rewards XP, coins, and
          leaderboard points.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <Link
            key={g.slug}
            href={`/dashboard/play/${g.slug}`}
            className="glass rounded-2xl p-5 hover:bg-white/10 transition group animate-fade-up flex flex-col"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition`}
            >
              {g.icon}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{g.title}</h3>
              <span className="text-[10px] rounded-full bg-white/10 px-2 py-0.5 text-white/60">
                {g.minAge}
              </span>
            </div>
            <p className="text-xs text-violet-300 mt-0.5">{g.tagline}</p>
            <p className="text-sm text-white/50 mt-2 flex-1">{g.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
              Play now
              <span className="group-hover:translate-x-1 transition">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
