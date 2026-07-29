import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, or, eq, isNull } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const rows = await db
    .select()
    .from(notifications)
    .where(or(eq(notifications.userId, session.userId), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const b = await req.json();
  if (b.action === "markAllRead") {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, session.userId));
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Unknown action" }, { status: 400 });
}
