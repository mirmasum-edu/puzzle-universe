"use client";

import CrudManager from "@/components/CrudManager";

export default function MissionsPage() {
  return (
    <CrudManager
      endpoint="/api/missions"
      title="Missions"
      icon="🎯"
      searchKey="title"
      defaults={{ title: "", description: "", type: "daily", target: 1, progress: 0, rewardXp: 100, rewardCoins: 50, completed: false }}
      fields={[
        { name: "title", label: "Title", placeholder: "Line Rush" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "type", label: "Type", type: "select", options: ["daily", "weekly", "monthly", "seasonal", "event"] },
        { name: "target", label: "Target", type: "number" },
        { name: "progress", label: "Progress", type: "number" },
        { name: "rewardXp", label: "Reward XP", type: "number" },
        { name: "rewardCoins", label: "Reward Coins", type: "number" },
        { name: "completed", label: "Completed", type: "checkbox" },
      ]}
      renderCard={(item, actions) => {
        const progress = Number(item.progress);
        const target = Number(item.target) || 1;
        const pct = Math.min(100, (progress / target) * 100);
        return (
          <div key={item.id} className="glass rounded-2xl p-5 animate-fade-up flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{String(item.title)}</h3>
              <span className="text-[10px] uppercase rounded-full bg-white/10 px-2 py-0.5">
                {String(item.type)}
              </span>
            </div>
            <p className="text-sm text-white/50 mt-1 flex-1">{String(item.description)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>
                  {Math.min(progress, target)}/{target}
                </span>
                {item.completed ? <span className="text-emerald-400">✔ Complete</span> : <span>{Math.round(pct)}%</span>}
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${item.completed ? "bg-emerald-400" : "bg-violet-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3 text-xs text-white/60">
              <span>⭐ {String(item.rewardXp)} XP</span>
              <span>🪙 {String(item.rewardCoins)}</span>
            </div>
            {actions && <div className="mt-3">{actions}</div>}
          </div>
        );
      }}
    />
  );
}
