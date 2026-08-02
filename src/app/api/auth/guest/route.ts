import { db } from "@/db";
import { users } from "@/db/schema";
import { setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const username = `Guest_${randomId}`;

  try {
    // Insert new guest user record in PostgreSQL via Drizzle
    const [user] = await db
      .insert(users)
      .values({
        username,
        // Using a temporary unique placeholder email so email unique constraints are preserved
        email: `guest_${randomId}_${Date.now()}@guest.puzzle.dev`,
        passwordHash: "GUEST_ACCOUNT_NO_PASSWORD",
        avatar: "🦊",
        role: "player",
        coins: 500,
        gems: 20,
        xp: 0,
        level: 1,
      })
      .returning();

    // Set the session cookie for this guest user
    await setSession({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Perform redirect to /dashboard
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  } catch (err) {
    console.error("Auto-guest generation error:", err);
    return Response.json({ error: "Failed to create guest session." }, { status: 500 });
  }
}
