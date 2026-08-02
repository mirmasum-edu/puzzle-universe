import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";
import { hashPassword, setSession } from "@/lib/auth";
import { validateRegister } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // 1. Validate inputs using existing validator
  const validation = validateRegister(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { email, password, username, country } = validation.data;

  // 2. Check if email is already taken by ANOTHER user
  const [existingUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, session.userId)))
    .limit(1);

  if (existingUser) {
    return Response.json(
      { error: "This email is already registered. Try logging in to that account." },
      { status: 400 }
    );
  }

  // 3. Hash password and update current user row
  try {
    const hashed = await hashPassword(password);

    const [row] = await db
      .update(users)
      .set({
        username,
        email,
        passwordHash: hashed,
        country,
      })
      .where(eq(users.id, session.userId))
      .returning();

    // Re-issue session cookie with upgraded details
    await setSession({
      userId: row.id,
      username: row.username,
      role: row.role,
    });

    return Response.json({
      ok: true,
      user: {
        username: row.username,
        email: row.email,
        avatar: row.avatar,
      },
    });
  } catch (err) {
    console.error("Account upgrade error:", err);
    return Response.json({ error: "Could not save account details." }, { status: 500 });
  }
}
