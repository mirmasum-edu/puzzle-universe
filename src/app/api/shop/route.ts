import { db } from "@/db";
import { shopItems } from "@/db/schema";
import { asc, ilike } from "drizzle-orm";
import { requireUser, requireAdmin, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const q = new URL(req.url).searchParams.get("q");
  const rows = q
    ? await db.select().from(shopItems).where(ilike(shopItems.name, `%${q}%`)).orderBy(asc(shopItems.id))
    : await db.select().from(shopItems).orderBy(asc(shopItems.id));
  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const b = await req.json();
  if (!b.name || !b.description) {
    return Response.json({ error: "Name and description required." }, { status: 400 });
  }
  const [row] = await db
    .insert(shopItems)
    .values({
      name: b.name,
      description: b.description,
      category: b.category || "theme",
      icon: b.icon || "🎨",
      priceCoins: Number(b.priceCoins) || 0,
      priceGems: Number(b.priceGems) || 0,
      featured: Boolean(b.featured),
    })
    .returning();
  return Response.json({ item: row });
}
