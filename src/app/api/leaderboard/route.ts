import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      country: users.country,
      highScore: users.highScore,
      level: users.level,
    })
    .from(users)
    .orderBy(desc(users.highScore))
    .limit(50);
  return Response.json({
    leaderboard: rows.map((r, i) => ({ ...r, rank: i + 1, me: r.id === session.userId })),
  });
}
