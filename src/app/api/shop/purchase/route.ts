import { db } from "@/db";
import { shopItems, users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, isResponse } from "@/lib/api";

export async function POST(req: Request) {
  const session = await requireUser();
  if (isResponse(session)) return session;
  const { itemId } = await req.json();
  const [item] = await db.select().from(shopItems).where(eq(shopItems.id, Number(itemId)));
  if (!item) return Response.json({ error: "Item not found" }, { status: 404 });
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (user.coins < item.priceCoins || user.gems < item.priceGems) {
    return Response.json({ error: "Not enough funds." }, { status: 400 });
  }
  await db
    .update(users)
    .set({ coins: user.coins - item.priceCoins, gems: user.gems - item.priceGems })
    .where(eq(users.id, session.userId));
  await db.insert(notifications).values({
    userId: session.userId,
    title: "Purchase complete",
    body: `You unlocked ${item.name} ${item.icon}`,
    type: "reward",
  });
  return Response.json({ ok: true });
}
