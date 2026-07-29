import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

// Simple in-memory guard is not persistent; we use a "last claimed" note via streak logic.
// For demo, claiming grants a reward and increments streak once per session request.
export async function POST() {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  const reward = 100 + user.streak * 20;
  const gems = 2;
  await db
    .update(users)
    .set({ coins: user.coins + reward, gems: user.gems + gems, streak: user.streak + 1 })
    .where(eq(users.id, session.userId));
  await db.insert(notifications).values({
    userId: session.userId,
    title: "Daily reward claimed",
    body: `You received ${reward} coins and ${gems} gems! Streak: ${user.streak + 1} days 🔥`,
    type: "reward",
  });
  return Response.json({ ok: true, reward, gems, streak: user.streak + 1 });
}
