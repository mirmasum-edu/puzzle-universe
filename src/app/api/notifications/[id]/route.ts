import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const { id } = await params;
  const [row] = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, Number(id)))
    .returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ item: row });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const { id } = await params;
  await db.delete(notifications).where(eq(notifications.id, Number(id)));
  return Response.json({ ok: true });
}
