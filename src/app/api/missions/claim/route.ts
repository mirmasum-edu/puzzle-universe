import { db } from "@/db";
import { missions, users, notifications, scores } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";
import { levelFromXp } from "@/lib/levels";

export async function POST(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;

  let body: { missionId: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { missionId } = body;
  if (!missionId) {
    return Response.json({ error: "Mission ID is required." }, { status: 400 });
  }

  // 1. Get the mission
  const [mis] = await db
    .select()
    .from(missions)
    .where(eq(missions.id, Number(missionId)));

  if (!mis) {
    return Response.json({ error: "Mission not found." }, { status: 404 });
  }

  // 2. Check if already claimed by looking up notification markers
  const claimType = `claim_mis_${mis.id}`;
  const [existingClaim] = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.userId),
        eq(notifications.type, claimType)
      )
    )
    .limit(1);

  if (existingClaim) {
    return Response.json({ error: "You have already claimed this mission's rewards." }, { status: 400 });
  }

  // 3. Retrieve user stats
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  // 4. Calculate actual user progress based on mission criteria
  let userValue = 0;
  const title = String(mis.title).toLowerCase();
  const descText = String(mis.description).toLowerCase();

  if (title.includes("play") || descText.includes("play")) {
    userValue = user.gamesPlayed;
  } else if (title.includes("win") || descText.includes("win")) {
    userValue = user.wins;
  } else if (title.includes("line") || title.includes("clear") || descText.includes("line") || descText.includes("clear")) {
    // Advanced database aggregation query: SUM lines cleared from scores table!
    const [result] = await db
      .select({ sumLines: sql<number>`sum(${scores.lines})::int` })
      .from(scores)
      .where(eq(scores.userId, session.userId));
    userValue = result?.sumLines || 0;
  } else if (title.includes("xp") || descText.includes("xp")) {
    userValue = user.xp;
  } else if (title.includes("combo") || descText.includes("combo")) {
    userValue = user.bestCombo;
  } else if (title.includes("score") || descText.includes("score")) {
    userValue = user.highScore;
  } else {
    userValue = user.gamesPlayed; // Fallback
  }

  const target = Number(mis.target) || 1;
  if (userValue < target) {
    return Response.json(
      { error: `Requirements not met. Required: ${target}, Current: ${userValue}` },
      { status: 400 }
    );
  }

  // 5. Reward user: coins + xp (and level up checks!)
  try {
    const newXp = user.xp + mis.rewardXp;
    const newLevel = levelFromXp(newXp);

    await db
      .update(users)
      .set({
        xp: newXp,
        coins: user.coins + mis.rewardCoins,
        level: newLevel,
      })
      .where(eq(users.id, session.userId));

    // Save claim indicator
    await db.insert(notifications).values({
      userId: session.userId,
      title: "🎯 Mission Completed!",
      body: `Successfully completed "${mis.title}" and claimed +${mis.rewardXp} XP and +${mis.rewardCoins} 🪙!`,
      type: claimType,
      read: false,
    });

    return Response.json({
      ok: true,
      rewardCoins: mis.rewardCoins,
      rewardXp: mis.rewardXp,
      newLevel: newLevel > user.level ? newLevel : null,
    });
  } catch (err) {
    console.error("Mission claim error:", err);
    return Response.json({ error: "Failed to claim mission rewards." }, { status: 500 });
  }
}
