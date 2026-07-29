"use client";

import CrudManager from "@/components/CrudManager";

export default function AchievementsPage() {
  return (
    <CrudManager
      endpoint="/api/achievements"
      title="Achievements"
      icon="🎖️"
      searchKey="title"
      defaults={{ title: "", description: "", category: "general", icon: "🏆", target: 1, rewardCoins: 50, rewardGems: 0 }}
      fields={[
        { name: "title", label: "Title", placeholder: "Line Breaker" },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: ["general", "beginner", "clears", "combo", "score", "streak", "games", "special", "economy", "progression", "missions", "meta", "events", "social"],
        },
        { name: "icon", label: "Icon (emoji)", placeholder: "🏆" },
        { name: "target", label: "Target", type: "number" },
        { name: "rewardCoins", label: "Reward Coins", type: "number" },
        { name: "rewardGems", label: "Reward Gems", type: "number" },
      ]}
      renderCard={(item, actions) => (
        <div key={item.id} className="glass rounded-2xl p-5 animate-fade-up flex flex-col">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{String(item.icon)}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{String(item.title)}</h3>
              <span className="text-[10px] uppercase tracking-wide text-violet-300">
                {String(item.category)}
              </span>
            </div>
          </div>
          <p className="text-sm text-white/50 mt-2 flex-1">{String(item.description)}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
            <span>🎯 {String(item.target)}</span>
            <span>🪙 {String(item.rewardCoins)}</span>
            <span>💠 {String(item.rewardGems)}</span>
          </div>
          {actions && <div className="mt-3">{actions}</div>}
        </div>
      )}
    />
  );
}
