import { db } from "@/db";
import { events } from "@/db/schema";
import { desc, ilike } from "drizzle-orm";
import { requireUser, requireAdmin, isResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const q = new URL(req.url).searchParams.get("q");
  const rows = q
    ? await db.select().from(events).where(ilike(events.title, `%${q}%`)).orderBy(desc(events.id))
    : await db.select().from(events).orderBy(desc(events.id));
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
    .insert(events)
    .values({
      title: b.title,
      description: b.description,
      icon: b.icon || "🎉",
      status: b.status || "live",
    })
    .returning();
  return Response.json({ item: row });
}
