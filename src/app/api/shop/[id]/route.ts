import { db } from "@/db";
import { shopItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, isResponse } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  const b = await req.json();
  const [row] = await db
    .update(shopItems)
    .set({
      name: b.name,
      description: b.description,
      category: b.category,
      icon: b.icon,
      priceCoins: Number(b.priceCoins) || 0,
      priceGems: Number(b.priceGems) || 0,
      featured: Boolean(b.featured),
    })
    .where(eq(shopItems.id, Number(id)))
    .returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ item: row });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  await db.delete(shopItems).where(eq(shopItems.id, Number(id)));
  return Response.json({ ok: true });
}
