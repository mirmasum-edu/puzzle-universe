"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/client";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Skeleton, EmptyState, Modal, Field, inputCls, ConfirmDialog } from "@/components/ui";

type Achievement = {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  target: number;
  rewardCoins: number;
  rewardGems: number;
};

type NotificationItem = {
  id: number;
  type: string;
};

const CATS = ["all", "general", "beginner", "clears", "combo", "score", "streak", "games", "special", "economy", "progression", "missions", "meta", "events", "social"];
const emptyForm = { title: "", description: "", category: "general", icon: "🏆", target: 1, rewardCoins: 50, rewardGems: 0 };

export default function AchievementsPage() {
  const { me, refresh } = useUser();
  const { push } = useToast();
  const isAdmin = me?.role === "admin";

  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [claiming, setClaiming] = useState<number | null>(null);

  // Admin CRUD states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Load achievements and notifications (claims)
  async function loadData() {
    try {
      const [achData, notifData] = await Promise.all([
        api<{ items: Achievement[] }>("/api/achievements"),
        api<{ items: NotificationItem[] }>("/api/notifications"),
      ]);
      setAchievements(achData.items);
      setNotifications(notifData.items);
    } catch {
      setAchievements([]);
      setNotifications([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // Compute claimed achievements set
  const claimedSet = useMemo(() => {
    const set = new Set<number>();
    if (notifications) {
      notifications.forEach((n) => {
        if (n.type.startsWith("claim_ach_")) {
          const id = Number(n.type.replace("claim_ach_", ""));
          if (!isNaN(id)) set.add(id);
        }
      });
    }
    return set;
  }, [notifications]);

  // Handle claiming rewards
  async function claimReward(ach: Achievement) {
    setClaiming(ach.id);
    try {
      const res = await api<{ ok: boolean; rewardCoins: number; rewardGems: number }>("/api/achievements/claim", {
        method: "POST",
        body: JSON.stringify({ achievementId: ach.id }),
      });
      if (res.ok) {
        push(`Claimed ${res.rewardCoins} 🪙 + ${res.rewardGems} 💠! "${ach.title}" claimed 🏆`, "success");
        refresh();
        loadData(); // Reload claiming state
      }
    } catch (e) {
      push(e instanceof Error ? e.message : "Claim failed", "error");
    } finally {
      setClaiming(null);
    }
  }

  // Admin operations
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(ach: Achievement) {
    setEditing(ach);
    setForm({
      title: ach.title,
      description: ach.description,
      category: ach.category,
      icon: ach.icon,
      target: ach.target,
      rewardCoins: ach.rewardCoins,
      rewardGems: ach.rewardGems,
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const d = await api<{ item: Achievement }>(`/api/achievements/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setAchievements((cur) => (cur ? cur.map((i) => (i.id === editing.id ? d.item : i)) : cur));
        push("Updated successfully", "success");
      } else {
        const d = await api<{ item: Achievement }>("/api/achievements", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setAchievements((cur) => (cur ? [...cur, d.item] : [d.item]));
        push("Created successfully", "success");
      }
      setModalOpen(false);
    } catch (err) {
      push(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    const prev = achievements;
    setAchievements((cur) => (cur ? cur.filter((i) => i.id !== id) : cur));
    setConfirmId(null);
    try {
      await api(`/api/achievements/${id}`, { method: "DELETE" });
      push("Deleted", "info");
    } catch {
      setAchievements(prev ?? null);
      push("Delete failed", "error");
    }
  }

  // Calculate specific user progress for any achievement card
  const getProgress = (ach: Achievement) => {
    if (!me) return { val: 0, pct: 0, unlocked: false };
    const target = Number(ach.target) || 1;
    const cat = String(ach.category).toLowerCase();
    const title = String(ach.title).toLowerCase();

    let val = 0;
    if (cat === "beginner" || cat === "games") {
      if (title.includes("win") || title.includes("century")) {
        val = me.wins;
      } else {
        val = me.gamesPlayed;
      }
    } else if (cat === "score") {
      val = me.highScore;
    } else if (cat === "combo") {
      val = me.bestCombo;
    } else if (cat === "streak") {
      val = me.streak;
    } else if (cat === "progression") {
      val = me.level;
    } else {
      val = me.gamesPlayed; // Default to games played
    }

    const pct = Math.min(100, (val / target) * 100);
    return { val, pct, unlocked: val >= target };
  };

  const filtered = achievements?.filter(
    (i) => filterCat === "all" || i.category === filterCat
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">🎖️ Achievements</h1>
          <p className="text-white/50 text-sm mt-1">
            Complete platform achievements to earn Coins & Gems.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold"
          >
            + New Achievement
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filterCat === c ? "bg-violet-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!achievements ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState icon="🎖️" title="No achievements" message="Nothing in this category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => {
            const { val, pct, unlocked } = getProgress(ach);
            const isClaimed = claimedSet.has(ach.id);
            const canClaim = unlocked && !isClaimed;

            return (
              <div
                key={ach.id}
                className={`glass rounded-2xl p-5 animate-fade-up flex flex-col relative transition duration-200 border ${
                  isClaimed
                    ? "border-emerald-500/20 bg-emerald-500/[0.01]"
                    : canClaim
                    ? "border-violet-500/40 bg-violet-500/[0.03] shadow-lg shadow-violet-500/10"
                    : "border-white/5"
                }`}
              >
                {isClaimed ? (
                  <span className="absolute top-3 right-3 text-[10px] rounded-full bg-emerald-400/20 text-emerald-300 px-2 py-0.5 font-bold">
                    ✔ CLAIMED
                  </span>
                ) : unlocked ? (
                  <span className="absolute top-3 right-3 text-[10px] rounded-full bg-violet-400/20 text-violet-300 px-2 py-0.5 font-bold animate-pulse">
                    🏆 UNLOCKED
                  </span>
                ) : null}

                <div className="flex items-start gap-3">
                  <span className="text-4xl">{ach.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{ach.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-violet-300 font-bold">
                      {ach.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-white/50 mt-2 flex-1 leading-relaxed">
                  {ach.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1">
                    <span>
                      Progress: {val.toLocaleString()} / {ach.target.toLocaleString()}
                    </span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isClaimed
                          ? "bg-emerald-400"
                          : unlocked
                          ? "bg-violet-400"
                          : "bg-white/30"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Reward info & action buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2.5 text-[10px] font-bold text-white/60">
                    {ach.rewardCoins > 0 && (
                      <span className="flex items-center gap-1">🪙 {ach.rewardCoins}</span>
                    )}
                    {ach.rewardGems > 0 && (
                      <span className="flex items-center gap-1">💠 {ach.rewardGems}</span>
                    )}
                  </div>

                  {canClaim && (
                    <button
                      onClick={() => claimReward(ach)}
                      disabled={claiming === ach.id}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95 transition"
                    >
                      {claiming === ach.id ? "Claiming…" : "CLAIM REWARD"}
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => openEdit(ach)}
                      className="flex-1 rounded-lg bg-white/10 hover:bg-white/15 py-1 text-[10px]"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setConfirmId(ach.id)}
                      className="flex-1 rounded-lg bg-rose-500/20 text-rose-300 py-1 text-[10px]"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin creation/edition Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Achievement" : "New Achievement"}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={inputCls}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATS.filter((c) => c !== "all").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Icon (emoji)">
            <input
              className={inputCls}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </Field>
          <Field label="Target">
            <input
              type="number"
              className={inputCls}
              value={form.target}
              onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reward Coins">
              <input
                type="number"
                className={inputCls}
                value={form.rewardCoins}
                onChange={(e) => setForm({ ...form, rewardCoins: Number(e.target.value) })}
              />
            </Field>
            <Field label="Reward Gems">
              <input
                type="number"
                className={inputCls}
                value={form.rewardGems}
                onChange={(e) => setForm({ ...form, rewardGems: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl bg-white/10 py-2.5 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete achievement?"
        message="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)}
      />
    </div>
  );
}
