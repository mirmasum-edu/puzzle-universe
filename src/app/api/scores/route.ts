import { db } from "@/db";
import { scores, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";
import { levelFromXp } from "@/lib/levels";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const rows = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, session.userId))
    .orderBy(desc(scores.createdAt))
    .limit(20);
  return Response.json({ scores: rows });
}

const VALID_MODES = new Set([
  "endless",
  "daily",
  "challenge",
  "adventure",
  "memory",
  "2048",
  "sliding",
  "sudoku",
  "flood",
]);

export async function POST(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Clamp values to sane bounds (basic anti-cheat / integrity guard).
  const finalScore = Math.min(1_000_000, Math.max(0, Math.trunc(Number(payload.score) || 0)));
  const finalLines = Math.min(100_000, Math.max(0, Math.trunc(Number(payload.lines) || 0)));
  const finalCombo = Math.min(1000, Math.max(0, Math.trunc(Number(payload.combo) || 0)));
  const rawMode = typeof payload.mode === "string" ? payload.mode : "endless";
  const mode = VALID_MODES.has(rawMode) ? rawMode : "endless";

  try {
    await db.insert(scores).values({
      userId: session.userId,
      score: finalScore,
      lines: finalLines,
      combo: finalCombo,
      mode,
    });

    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }
    const gainedXp = Math.floor(finalScore / 10) + finalLines * 5;
    const gainedCoins = Math.floor(finalScore / 25);
    const newXp = user.xp + gainedXp;
    const newHigh = Math.max(user.highScore, finalScore);
    const newBestCombo = Math.max(user.bestCombo, finalCombo);
    const isWin = finalScore >= 1000;

    await db
      .update(users)
      .set({
        xp: newXp,
        coins: user.coins + gainedCoins,
        level: levelFromXp(newXp),
        highScore: newHigh,
        bestCombo: newBestCombo,
        gamesPlayed: user.gamesPlayed + 1,
        wins: user.wins + (isWin ? 1 : 0),
      })
      .where(eq(users.id, session.userId));

    return Response.json({
      ok: true,
      gainedXp,
      gainedCoins,
      newHighScore: newHigh > user.highScore,
    });
  } catch (err) {
    console.error("score submit error:", err);
    return Response.json({ error: "Could not save score." }, { status: 500 });
  }
}
