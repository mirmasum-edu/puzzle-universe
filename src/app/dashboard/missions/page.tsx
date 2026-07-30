"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/client";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Skeleton, EmptyState, Modal, Field, inputCls, ConfirmDialog } from "@/components/ui";

type Mission = {
  id: number;
  title: string;
  description: string;
  type: string;
  target: number;
  rewardXp: number;
  rewardCoins: number;
};

type ScoreItem = {
  lines: number;
};

type NotificationItem = {
  id: number;
  type: string;
};

const TYPES = ["all", "daily", "weekly", "monthly", "seasonal", "event"];
const emptyForm = { title: "", description: "", type: "daily", target: 1, rewardXp: 100, rewardCoins: 50 };

export default function MissionsPage() {
  const { me, refresh } = useUser();
  const { push } = useToast();
  const isAdmin = me?.role === "admin";

  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [scores, setScores] = useState<ScoreItem[] | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [claiming, setClaiming] = useState<number | null>(null);

  // Admin CRUD states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Load missions, notifications (claims) and user scores (to count total lines cleared)
  async function loadData() {
    try {
      const [misData, notifData, scoresData] = await Promise.all([
        api<{ items: Mission[] }>("/api/missions"),
        api<{ items: NotificationItem[] }>("/api/notifications"),
        api<{ scores: ScoreItem[] }>("/api/scores"),
      ]);
      setMissions(misData.items);
      setNotifications(notifData.items);
      setScores(scoresData.scores);
    } catch {
      setMissions([]);
      setNotifications([]);
      setScores([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // Compute claimed missions set
  const claimedSet = useMemo(() => {
    const set = new Set<number>();
    if (notifications) {
      notifications.forEach((n) => {
        if (n.type.startsWith("claim_mis_")) {
          const id = Number(n.type.replace("claim_mis_", ""));
          if (!isNaN(id)) set.add(id);
        }
      });
    }
    return set;
  }, [notifications]);

  // Count total lines cleared
  const totalLinesCleared = useMemo(() => {
    if (!scores) return 0;
    return scores.reduce((sum, s) => sum + (Number(s.lines) || 0), 0);
  }, [scores]);

  // Handle claiming rewards
  async function claimReward(mis: Mission) {
    setClaiming(mis.id);
    try {
      const res = await api<{ ok: boolean; rewardCoins: number; rewardXp: number; newLevel: number | null }>("/api/missions/claim", {
        method: "POST",
        body: JSON.stringify({ missionId: mis.id }),
      });
      if (res.ok) {
        push(`Claimed +${res.rewardXp} XP and +${res.rewardCoins} 🪙! "${mis.title}" complete ✔`, "success");
        if (res.newLevel) {
          push(`🎉 LEVEL UP! You reached Level ${res.newLevel}! 🎉`, "success");
        }
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

  function openEdit(mis: Mission) {
    setEditing(mis);
    setForm({
      title: mis.title,
      description: mis.description,
      type: mis.type,
      target: mis.target,
      rewardXp: mis.rewardXp,
      rewardCoins: mis.rewardCoins,
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const d = await api<{ item: Mission }>(`/api/missions/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setMissions((cur) => (cur ? cur.map((i) => (i.id === editing.id ? d.item : i)) : cur));
        push("Updated successfully", "success");
      } else {
        const d = await api<{ item: Mission }>("/api/missions", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMissions((cur) => (cur ? [...cur, d.item] : [d.item]));
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
    const prev = missions;
    setMissions((cur) => (cur ? cur.filter((i) => i.id !== id) : cur));
    setConfirmId(null);
    try {
      await api(`/api/missions/${id}`, { method: "DELETE" });
      push("Deleted", "info");
    } catch {
      setMissions(prev ?? null);
      push("Delete failed", "error");
    }
  }

  // Calculate dynamic progress for a mission card
  const getProgress = (mis: Mission) => {
    if (!me) return { val: 0, pct: 0, completed: false };
    const target = Number(mis.target) || 1;
    const title = String(mis.title).toLowerCase();
    const descText = String(mis.description).toLowerCase();

    let val = 0;
    if (title.includes("play") || descText.includes("play")) {
      val = me.gamesPlayed;
    } else if (title.includes("win") || descText.includes("win")) {
      val = me.wins;
    } else if (title.includes("line") || title.includes("clear") || descText.includes("line") || descText.includes("clear")) {
      val = totalLinesCleared;
    } else if (title.includes("xp") || descText.includes("xp")) {
      val = me.xp;
    } else if (title.includes("combo") || descText.includes("combo")) {
      val = me.bestCombo;
    } else if (title.includes("score") || descText.includes("score")) {
      val = me.highScore;
    } else {
      val = me.gamesPlayed; // Default fallback
    }

    const pct = Math.min(100, (val / target) * 100);
    return { val, pct, completed: val >= target };
  };

  const filtered = missions?.filter(
    (i) => filterType === "all" || i.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">🎯 Missions</h1>
          <p className="text-white/50 text-sm mt-1">
            Complete daily, weekly and seasonal challenges to earn Coins & XP.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold"
          >
            + New Mission
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filterType === t ? "bg-violet-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {!missions ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState icon="🎯" title="No missions" message="Nothing in this category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mis) => {
            const { val, pct, completed } = getProgress(mis);
            const isClaimed = claimedSet.has(mis.id);
            const canClaim = completed && !isClaimed;

            return (
              <div
                key={mis.id}
                className={`glass rounded-2xl p-5 animate-fade-up flex flex-col relative border transition duration-200 ${
                  isClaimed
                    ? "border-emerald-500/20 bg-emerald-500/[0.01]"
                    : canClaim
                    ? "border-violet-500/40 bg-violet-500/[0.03] shadow-lg shadow-violet-500/10"
                    : "border-white/5"
                }`}
              >
                {isClaimed ? (
                  <span className="absolute top-3 right-3 text-[10px] rounded-full bg-emerald-400/20 text-emerald-300 px-2 py-0.5 font-bold">
                    ✔ COMPLETE
                  </span>
                ) : completed ? (
                  <span className="absolute top-3 right-3 text-[10px] rounded-full bg-violet-400/20 text-violet-300 px-2 py-0.5 font-bold animate-pulse">
                    🏆 CLAIM READY
                  </span>
                ) : null}

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{mis.title}</h3>
                  <span className="text-[10px] uppercase rounded-full bg-white/10 px-2.5 py-0.5 text-white/70 font-semibold">
                    {mis.type}
                  </span>
                </div>

                <p className="text-xs text-white/50 mt-2 flex-1 leading-relaxed">
                  {mis.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1">
                    <span>
                      {Math.min(val, mis.target).toLocaleString()} / {mis.target.toLocaleString()}
                    </span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isClaimed
                          ? "bg-emerald-400"
                          : completed
                          ? "bg-violet-400"
                          : "bg-white/30"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Rewards & claim action */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2.5 text-[10px] font-bold text-white/60">
                    <span className="flex items-center gap-1">⭐ {mis.rewardXp} XP</span>
                    <span className="flex items-center gap-1">🪙 {mis.rewardCoins}</span>
                  </div>

                  {canClaim && (
                    <button
                      onClick={() => claimReward(mis)}
                      disabled={claiming === mis.id}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95 transition"
                    >
                      {claiming === mis.id ? "Claiming…" : "CLAIM REWARDS"}
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => openEdit(mis)}
                      className="flex-1 rounded-lg bg-white/10 hover:bg-white/15 py-1 text-[10px]"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setConfirmId(mis.id)}
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
        title={editing ? "Edit Mission" : "New Mission"}
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
          <Field label="Type">
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.filter((t) => t !== "all").map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            <Field label="Reward XP">
              <input
                type="number"
                className={inputCls}
                value={form.rewardXp}
                onChange={(e) => setForm({ ...form, rewardXp: Number(e.target.value) })}
              />
            </Field>
            <Field label="Reward Coins">
              <input
                type="number"
                className={inputCls}
                value={form.rewardCoins}
                onChange={(e) => setForm({ ...form, rewardCoins: Number(e.target.value) })}
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
        title="Delete mission?"
        message="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)}
      />
    </div>
  );
}
