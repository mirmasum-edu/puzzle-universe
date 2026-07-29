"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { useUser } from "@/components/UserContext";
import { Skeleton, EmptyState, Modal, ConfirmDialog, Field, inputCls } from "@/components/ui";

type Item = {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  priceCoins: number;
  priceGems: number;
  featured: boolean;
};

const CATS = ["all", "theme", "effect", "frame", "music", "bundle"];
const emptyForm = { name: "", description: "", category: "theme", icon: "🎨", priceCoins: 0, priceGems: 0, featured: false };

export default function ShopPage() {
  const { me, refresh } = useUser();
  const { push } = useToast();
  const isAdmin = me?.role === "admin";
  const [items, setItems] = useState<Item[] | null>(null);
  const [cat, setCat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [buying, setBuying] = useState<number | null>(null);

  async function load() {
    try {
      const d = await api<{ items: Item[] }>("/api/shop");
      setItems(d.items);
    } catch {
      setItems([]);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function buy(item: Item) {
    setBuying(item.id);
    try {
      await api("/api/shop/purchase", { method: "POST", body: JSON.stringify({ itemId: item.id }) });
      push(`Unlocked ${item.name}! ${item.icon}`, "success");
      refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : "Purchase failed", "error");
    } finally {
      setBuying(null);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(item: Item) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      icon: item.icon,
      priceCoins: item.priceCoins,
      priceGems: item.priceGems,
      featured: item.featured,
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        const d = await api<{ item: Item }>(`/api/shop/${editing.id}`, { method: "PATCH", body: JSON.stringify(form) });
        setItems((cur) => (cur ? cur.map((i) => (i.id === editing.id ? d.item : i)) : cur));
        push("Updated", "success");
      } else {
        const d = await api<{ item: Item }>("/api/shop", { method: "POST", body: JSON.stringify(form) });
        setItems((cur) => (cur ? [...cur, d.item] : [d.item]));
        push("Created", "success");
      }
      setModalOpen(false);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  async function remove(id: number) {
    const prev = items;
    setItems((cur) => (cur ? cur.filter((i) => i.id !== id) : cur));
    setConfirmId(null);
    try {
      await api(`/api/shop/${id}`, { method: "DELETE" });
      push("Deleted", "info");
    } catch {
      setItems(prev ?? null);
      push("Delete failed", "error");
    }
  }

  const filtered = items?.filter((i) => cat === "all" || i.category === cat);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">🛍️ Shop</h1>
          <p className="text-white/50 text-sm mt-1">Spend coins and gems on cosmetics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1.5 text-sm">🪙 {me?.coins}</span>
          <span className="rounded-full bg-white/5 px-3 py-1.5 text-sm">💠 {me?.gems}</span>
          {isAdmin && (
            <button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold">
              + New
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${cat === c ? "bg-violet-500" : "bg-white/5 hover:bg-white/10"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {!items ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState icon="🛍️" title="No items" message="Nothing in this category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-5 animate-fade-up flex flex-col relative">
              {item.featured && (
                <span className="absolute top-3 right-3 text-[10px] rounded-full bg-amber-400/20 text-amber-300 px-2 py-0.5">
                  ⭐ Featured
                </span>
              )}
              <span className="text-4xl">{item.icon}</span>
              <h3 className="font-semibold mt-2">{item.name}</h3>
              <p className="text-sm text-white/50 mt-1 flex-1">{item.description}</p>
              <div className="flex items-center gap-3 mt-3 text-sm font-semibold">
                {item.priceCoins > 0 && <span>🪙 {item.priceCoins}</span>}
                {item.priceGems > 0 && <span>💠 {item.priceGems}</span>}
                {item.priceCoins === 0 && item.priceGems === 0 && <span className="text-emerald-400">Free</span>}
              </div>
              <button
                onClick={() => buy(item)}
                disabled={buying === item.id}
                className="mt-3 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {buying === item.id ? "Buying…" : "Buy"}
              </button>
              {isAdmin && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(item)} className="flex-1 rounded-lg bg-white/10 hover:bg-white/15 py-1 text-xs">
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="flex-1 rounded-lg bg-rose-500/20 text-rose-300 py-1 text-xs"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Item" : "New Item"}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Name">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATS.filter((c) => c !== "all").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Icon (emoji)">
            <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price Coins">
              <input type="number" className={inputCls} value={form.priceCoins} onChange={(e) => setForm({ ...form, priceCoins: Number(e.target.value) })} />
            </Field>
            <Field label="Price Gems">
              <input type="number" className={inputCls} value={form.priceGems} onChange={(e) => setForm({ ...form, priceGems: Number(e.target.value) })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl bg-white/10 py-2.5 font-medium">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 font-semibold">
              {editing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete item?"
        message="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)}
      />
    </div>
  );
}
