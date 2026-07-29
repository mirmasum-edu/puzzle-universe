import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";
import { validateLogin } from "@/lib/validation";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Rate limit: 10 login attempts per IP per 5 minutes.
    const rl = rateLimit(`login:${clientIp(req)}`, 10, 5 * 60 * 1000);
    if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = validateLogin(body);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    const { email, password } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      // Generic message to avoid user enumeration.
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setSession({ userId: user.id, username: user.username, role: user.role });
    return Response.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    return Response.json({ error: "Login failed." }, { status: 500 });
  }
}
