import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { xpProgress } from "@/lib/levels";
import { UserProvider, Me } from "@/components/UserContext";
import { ToastProvider } from "@/components/Toast";
import Shell from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user) redirect("/");
  const prog = xpProgress(user.xp);
  const me: Me = {
    id: user.id,
    username: user.username,
    email: user.email,
    country: user.country,
    avatar: user.avatar,
    role: user.role,
    xp: user.xp,
    coins: user.coins,
    gems: user.gems,
    level: prog.level,
    xpInto: prog.into,
    xpNeeded: prog.needed,
    streak: user.streak,
    highScore: user.highScore,
    gamesPlayed: user.gamesPlayed,
    wins: user.wins,
    bestCombo: user.bestCombo,
  };

  return (
    <ToastProvider>
      <UserProvider initial={me}>
        <Shell>{children}</Shell>
      </UserProvider>
    </ToastProvider>
  );
}
