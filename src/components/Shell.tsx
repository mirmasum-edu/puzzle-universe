"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

type NavItem = { href: string; label: string; icon: string; admin?: boolean };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/play", label: "Play", icon: "🎮" },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/dashboard/achievements", label: "Achievements", icon: "🎖️" },
  { href: "/dashboard/missions", label: "Missions", icon: "🎯" },
  { href: "/dashboard/shop", label: "Shop", icon: "🛍️" },
  { href: "/dashboard/events", label: "Events", icon: "🎉" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  { href: "/dashboard/about", label: "About Creator", icon: "👨‍💻" },
  { href: "/dashboard/admin", label: "Admin", icon: "🛠️", admin: true },
];

type Notif = { id: number; title: string; body: string; type: string; read: boolean; createdAt: string };

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me } = useUser();
  const { push } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    // Defer the initial sync out of the effect body to avoid cascading renders.
    const id = setTimeout(sync, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const loadNotifs = useCallback(() => {
    api<{ items: Notif[] }>("/api/notifications")
      .then((d) => setNotifs(d.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  const unread = notifs.filter((n) => !n.read).length;

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    push("Logged out", "info");
    // Hard navigation ensures the session cookie clearance takes effect immediately.
    window.location.assign("/");
  }

  async function markAll() {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    await api("/api/notifications", { method: "POST", body: JSON.stringify({ action: "markAllRead" }) }).catch(() => {});
  }

  const nav = NAV.filter((n) => !n.admin || me?.role === "admin");

  return (
    <div className="pu-bg min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 glass-strong border-r border-white/10 p-4 flex flex-col transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 px-2 py-3">
          <span className="text-2xl">🧩</span>
          <span className="font-black text-lg">Puzzle Universe</span>
        </div>
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-violet-500/90 text-white shadow-lg" : "text-white/70 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
        >
          <span className="text-lg">🚪</span> Log Out
        </button>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-white/10 px-4 lg:px-8 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="lg:hidden w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"
          >
            ☰
          </button>
          {!online && (
            <span className="text-xs rounded-full bg-amber-500/20 text-amber-300 px-3 py-1">
              ⚡ Offline
            </span>
          )}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <span className="rounded-full bg-white/5 px-3 py-1.5">🪙 {me?.coins ?? 0}</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5">💠 {me?.gems ?? 0}</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5">🔥 {me?.streak ?? 0}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((o) => !o);
                  if (!notifOpen && unread) markAll();
                }}
                className="relative w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl p-3 shadow-2xl animate-fade-up max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-sm font-semibold">Notifications</span>
                    <button onClick={markAll} className="text-xs text-violet-300">
                      Mark all read
                    </button>
                  </div>
                  {notifs.length === 0 ? (
                    <p className="text-center text-xs text-white/40 py-6">No notifications yet</p>
                  ) : (
                    <div className="space-y-1">
                      {notifs.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded-xl px-3 py-2 ${n.read ? "bg-white/5" : "bg-violet-500/15"}`}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-white/50">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">
                {me?.avatar}
              </span>
              <span className="hidden md:block text-sm font-medium">{me?.username}</span>
            </Link>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
