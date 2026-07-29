"use client";

import { useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { useUser } from "@/components/UserContext";
import { Skeleton, EmptyState, Modal, ConfirmDialog, Field, inputCls } from "@/components/ui";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox";
  options?: string[];
  placeholder?: string;
};

type Item = Record<string, unknown> & { id: number };

export default function CrudManager({
  endpoint,
  title,
  icon,
  fields,
  searchKey,
  renderCard,
  defaults,
}: {
  endpoint: string;
  title: string;
  icon: string;
  fields: FieldDef[];
  searchKey: string;
  renderCard: (item: Item, actions: ReactNode, isAdmin: boolean) => ReactNode;
  defaults: Record<string, unknown>;
}) {
  const { me } = useUser();
  const { push } = useToast();
  const isAdmin = me?.role === "admin";
  const [items, setItems] = useState<Item[] | null>(null);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(defaults);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const d = await api<{ items: Item[] }>(endpoint);
      setItems(d.items);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  function openCreate() {
    setEditing(null);
    setForm(defaults);
    setModalOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    const f: Record<string, unknown> = {};
    for (const fd of fields) f[fd.name] = item[fd.name];
    setForm(f);
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // optimistic
    const prev = items;
    try {
      if (editing) {
        const optimistic = items!.map((it) => (it.id === editing.id ? { ...it, ...form } : it));
        setItems(optimistic);
        const d = await api<{ item: Item }>(`${endpoint}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setItems((cur) => (cur ? cur.map((it) => (it.id === editing.id ? d.item : it)) : cur));
        push("Updated successfully", "success");
      } else {
        const d = await api<{ item: Item }>(endpoint, {
          method: "POST",
          body: JSON.stringify(form),
        });
        setItems((cur) => (cur ? [...cur, d.item] : [d.item]));
        push("Created successfully", "success");
      }
      setModalOpen(false);
    } catch (err) {
      setItems(prev ?? null);
      push(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    const prev = items;
    const removed = items?.find((i) => i.id === id);
    setItems((cur) => (cur ? cur.filter((i) => i.id !== id) : cur));
    setConfirmId(null);
    try {
      await api(`${endpoint}/${id}`, { method: "DELETE" });
      push("Deleted", "info");
    } catch {
      setItems(prev ?? null);
      push(`Could not delete ${removed ? "item" : ""}`, "error");
    }
  }

  const filtered = items?.filter((i) =>
    String(i[searchKey] ?? "")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">
            {icon} {title}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {isAdmin ? "Manage entries with full CRUD controls." : `Browse all ${title.toLowerCase()}.`}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60"
          />
          {isAdmin && (
            <button
              onClick={openCreate}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold whitespace-nowrap"
            >
              + New
            </button>
          )}
        </div>
      </div>

      {!items ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          icon={icon}
          title={`No ${title.toLowerCase()} found`}
          message={q ? "Try a different search term." : "Nothing here yet."}
          action={
            isAdmin && !q ? (
              <button onClick={openCreate} className="mt-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold">
                + Create first entry
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) =>
            renderCard(
              item,
              isAdmin ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1 text-xs"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-3 py-1 text-xs"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ) : null,
              isAdmin
            )
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${title}` : `New ${title}`}>
        <form onSubmit={save} className="space-y-4">
          {fields.map((fd) => (
            <Field key={fd.name} label={fd.label}>
              {fd.type === "textarea" ? (
                <textarea
                  className={inputCls}
                  rows={3}
                  value={String(form[fd.name] ?? "")}
                  onChange={(e) => setForm({ ...form, [fd.name]: e.target.value })}
                  placeholder={fd.placeholder}
                />
              ) : fd.type === "select" ? (
                <select
                  className={inputCls}
                  value={String(form[fd.name] ?? "")}
                  onChange={(e) => setForm({ ...form, [fd.name]: e.target.value })}
                >
                  {fd.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : fd.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form[fd.name])}
                    onChange={(e) => setForm({ ...form, [fd.name]: e.target.checked })}
                  />
                  Enabled
                </label>
              ) : (
                <input
                  type={fd.type === "number" ? "number" : "text"}
                  className={inputCls}
                  value={String(form[fd.name] ?? "")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [fd.name]: fd.type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                  placeholder={fd.placeholder}
                />
              )}
            </Field>
          ))}
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
              {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete entry?"
        message="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)}
      />
    </div>
  );
}
