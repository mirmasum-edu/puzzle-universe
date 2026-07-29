import { db } from "@/db";
import { users, scores, achievements, missions, shopItems, events } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const [u] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  const [s] = await db.select({ c: sql<number>`count(*)::int` }).from(scores);
  const [a] = await db.select({ c: sql<number>`count(*)::int` }).from(achievements);
  const [m] = await db.select({ c: sql<number>`count(*)::int` }).from(missions);
  const [sh] = await db.select({ c: sql<number>`count(*)::int` }).from(shopItems);
  const [ev] = await db.select({ c: sql<number>`count(*)::int` }).from(events);
  const [totalScore] = await db.select({ t: sql<number>`coalesce(sum(score),0)::int` }).from(scores);

  return Response.json({
    stats: {
      users: u.c,
      scores: s.c,
      achievements: a.c,
      missions: m.c,
      shopItems: sh.c,
      events: ev.c,
      totalScore: totalScore.t,
    },
  });
}
