import { db } from "@/db";
import { missions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, isResponse } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  const b = await req.json();
  const [row] = await db
    .update(missions)
    .set({
      title: b.title,
      description: b.description,
      type: b.type,
      target: Number(b.target) || 1,
      progress: Number(b.progress) || 0,
      rewardXp: Number(b.rewardXp) || 0,
      rewardCoins: Number(b.rewardCoins) || 0,
      completed: Boolean(b.completed),
    })
    .where(eq(missions.id, Number(id)))
    .returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ item: row });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  await db.delete(missions).where(eq(missions.id, Number(id)));
  return Response.json({ ok: true });
}
