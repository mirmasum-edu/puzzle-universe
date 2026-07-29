import { db } from "@/db";
import { achievements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, isResponse } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  const b = await req.json();
  const [row] = await db
    .update(achievements)
    .set({
      title: b.title,
      description: b.description,
      category: b.category,
      icon: b.icon,
      target: Number(b.target) || 1,
      rewardCoins: Number(b.rewardCoins) || 0,
      rewardGems: Number(b.rewardGems) || 0,
    })
    .where(eq(achievements.id, Number(id)))
    .returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ item: row });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  await db.delete(achievements).where(eq(achievements.id, Number(id)));
  return Response.json({ ok: true });
}
