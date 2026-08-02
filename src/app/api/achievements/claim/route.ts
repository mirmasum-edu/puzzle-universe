import { db } from "@/db";
import { achievements, users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

export async function POST(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;

  let body: { achievementId: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { achievementId } = body;
  if (!achievementId) {
    return Response.json({ error: "Achievement ID is required." }, { status: 400 });
  }

  // 1. Get the achievement
  const [ach] = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, Number(achievementId)));

  if (!ach) {
    return Response.json({ error: "Achievement not found." }, { status: 404 });
  }

  // 2. Check if already claimed by looking up notification markers
  const claimType = `claim_ach_${ach.id}`;
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
    return Response.json({ error: "You have already claimed this achievement." }, { status: 400 });
  }

  // 3. Verify user stats meet target
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  let userValue = 0;
  const category = String(ach.category).toLowerCase();
  const title = String(ach.title).toLowerCase();

  if (category === "beginner" || category === "games") {
    if (title.includes("win") || title.includes("century")) {
      userValue = user.wins;
    } else {
      userValue = user.gamesPlayed;
    }
  } else if (category === "score") {
    userValue = user.highScore;
  } else if (category === "combo") {
    userValue = user.bestCombo;
  } else if (category === "streak") {
    userValue = user.streak;
  } else if (category === "progression") {
    userValue = user.level;
  } else {
    // If it's a general or special category, default check game played or win to allow progression
    userValue = user.gamesPlayed;
  }

  const target = Number(ach.target) || 1;
  if (userValue < target) {
    return Response.json(
      { error: `Requirements not met. Required: ${target}, Current: ${userValue}` },
      { status: 400 }
    );
  }

  // 4. Update user balance & insert claim record
  try {
    await db
      .update(users)
      .set({
        coins: user.coins + ach.rewardCoins,
        gems: user.gems + ach.rewardGems,
      })
      .where(eq(users.id, session.userId));

    await db.insert(notifications).values({
      userId: session.userId,
      title: "🏆 Achievement Unlocked!",
      body: `Unlocked "${ach.title}" ${ach.icon} and claimed ${ach.rewardCoins} 🪙 + ${ach.rewardGems} 💠!`,
      type: claimType,
      read: false,
    });

    return Response.json({
      ok: true,
      rewardCoins: ach.rewardCoins,
      rewardGems: ach.rewardGems,
    });
  } catch (err) {
    console.error("Achievement claim error:", err);
    return Response.json({ error: "Failed to claim achievement rewards." }, { status: 500 });
  }
}
