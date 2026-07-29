import { db } from "@/db";
import { achievements } from "@/db/schema";
import { asc, ilike } from "drizzle-orm";
import { requireUser, requireAdmin, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const q = new URL(req.url).searchParams.get("q");
  const rows = q
    ? await db.select().from(achievements).where(ilike(achievements.title, `%${q}%`)).orderBy(asc(achievements.id))
    : await db.select().from(achievements).orderBy(asc(achievements.id));
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
    .insert(achievements)
    .values({
      title: b.title,
      description: b.description,
      category: b.category || "general",
      icon: b.icon || "🏆",
      target: Number(b.target) || 1,
      rewardCoins: Number(b.rewardCoins) || 0,
      rewardGems: Number(b.rewardGems) || 0,
    })
    .returning();
  return Response.json({ item: row });
}
