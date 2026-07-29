import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, isResponse } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  const b = await req.json();
  const [row] = await db
    .update(events)
    .set({ title: b.title, description: b.description, icon: b.icon, status: b.status })
    .where(eq(events.id, Number(id)))
    .returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ item: row });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;
  const { id } = await params;
  await db.delete(events).where(eq(events.id, Number(id)));
  return Response.json({ ok: true });
}
