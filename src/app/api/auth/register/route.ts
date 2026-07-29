import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth";
import { validateRegister } from "@/lib/validation";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐳", "🦉", "🐝", "🐰", "🐨", "🐯"];

export async function POST(req: Request) {
  try {
    // Rate limit: 5 signups per IP per 10 minutes.
    const rl = rateLimit(`register:${clientIp(req)}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = validateRegister(body);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    const { username, email, password, country } = result.data;

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return Response.json({ error: "Email already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const [user] = await db
      .insert(users)
      .values({ username, email, passwordHash, country, avatar })
      .returning();

    await setSession({ userId: user.id, username: user.username, role: user.role });
    return Response.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("register error:", err);
    return Response.json({ error: "Registration failed." }, { status: 500 });
  }
}
