import { db } from "@/db";
import { missions } from "@/db/schema";
import { asc, ilike } from "drizzle-orm";
import { requireUser, requireAdmin, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const q = new URL(req.url).searchParams.get("q");
  const rows = q
    ? await db.select().from(missions).where(ilike(missions.title, `%${q}%`)).orderBy(asc(missions.id))
    : await db.select().from(missions).orderBy(asc(missions.id));
  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const b = await req.json();
  if (!b.title || !b.description) {
    return Response.json({ error: "Title and description required." }, { status: 400 });
  }
  const [row] = await db
    .insert(missions)
    .values({
      title: b.title,
      description: b.description,
      type: b.type || "daily",
      target: Number(b.target) || 1,
      progress: Number(b.progress) || 0,
      rewardXp: Number(b.rewardXp) || 0,
      rewardCoins: Number(b.rewardCoins) || 0,
      completed: Boolean(b.completed),
    })
    .returning();
  return Response.json({ item: row });
}
