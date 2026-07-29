"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/client";

export type Me = {
  id: number;
  username: string;
  email: string;
  country: string;
  avatar: string;
  role: string;
  xp: number;
  coins: number;
  gems: number;
  level: number;
  xpInto: number;
  xpNeeded: number;
  streak: number;
  highScore: number;
  gamesPlayed: number;
  wins: number;
  bestCombo: number;
};

type Ctx = {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setMe: (m: Me | null) => void;
};

const UserCtx = createContext<Ctx>({
  me: null,
  loading: true,
  refresh: async () => {},
  setMe: () => {},
});

export function useUser() {
  return useContext(UserCtx);
}

export function UserProvider({ initial, children }: { initial: Me | null; children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(initial);
  const [loading, setLoading] = useState(!initial);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: Me | null }>("/api/auth/me");
      setMe(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initial) refresh();
  }, [initial, refresh]);

  return (
    <UserCtx.Provider value={{ me, loading, refresh, setMe }}>
      {children}
    </UserCtx.Provider>
  );
}
