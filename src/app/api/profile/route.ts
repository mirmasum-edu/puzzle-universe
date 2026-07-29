import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐳", "🦉", "🐝", "🐰", "🐨", "🐯"];

export async function PATCH(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const b = await req.json();
  const patch: Record<string, unknown> = {};
  if (typeof b.username === "string" && b.username.trim()) patch.username = b.username.trim();
  if (typeof b.country === "string") patch.country = b.country;
  if (typeof b.avatar === "string" && AVATARS.includes(b.avatar)) patch.avatar = b.avatar;
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }
  const [row] = await db.update(users).set(patch).where(eq(users.id, session.userId)).returning();
  return Response.json({ ok: true, user: { username: row.username, country: row.country, avatar: row.avatar } });
}
