import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { xpProgress } from "@/lib/levels";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user) return Response.json({ user: null });
  const prog = xpProgress(user.xp);
  return Response.json({
    user: {
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
    },
  });
}
