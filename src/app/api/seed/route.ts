import { db } from "@/db";
import {
  users,
  scores,
  achievements,
  missions,
  shopItems,
  notifications,
  events,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { levelFromXp } from "@/lib/levels";

export const dynamic = "force-dynamic";

const COUNTRIES = ["US", "UK", "CA", "AU", "DE", "IN", "BD", "ID", "BR", "PH"];
const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐳", "🦉", "🐝", "🐰", "🐨", "🐯"];
const NAMES = [
  "BlockMaster", "PuzzleQueen", "GridNinja", "ComboKing", "TetraFox", "LineWizard",
  "NeonPanda", "PixelPirate", "ZenSolver", "TurboTiles", "MegaMatch", "QuickCube",
  "StarStacker", "LogicLlama", "SwiftShapes", "CosmicClear", "DailyDynamo", "SudokuSage",
];

export async function POST() {
  // Production lock: prevent random seeding on public URLs unless explicitly enabled or default active.
  const isProd = process.env.NODE_ENV === "production";
  const seederEnabled = process.env.ENABLE_SEEDER !== "false"; // Allowed by default, can be disabled by setting ENABLE_SEEDER=false
  if (isProd && !seederEnabled) {
    return Response.json(
      { error: "Seeding is disabled in production. Set ENABLE_SEEDER=true to override." },
      { status: 403 }
    );
  }

  const [existing] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  if (existing.c > 0) {
    return Response.json({ ok: true, seeded: false, message: "Already seeded" });
  }

  const adminHash = await hashPassword("password123");

  // Admin + demo player
  const seedUsers = [
    {
      username: "Admin",
      email: "admin@puzzle.dev",
      passwordHash: adminHash,
      country: "US",
      avatar: "👑",
      role: "admin",
      xp: 8200,
      coins: 9999,
      gems: 250,
      streak: 12,
      highScore: 18450,
      gamesPlayed: 240,
      wins: 190,
      bestCombo: 14,
    },
    {
      username: "DemoPlayer",
      email: "demo@puzzle.dev",
      passwordHash: adminHash,
      country: "CA",
      avatar: "🦊",
      role: "player",
      xp: 3400,
      coins: 1250,
      gems: 42,
      streak: 5,
      highScore: 9200,
      gamesPlayed: 84,
      wins: 51,
      bestCombo: 9,
    },
  ];

  for (const u of seedUsers) {
    await db.insert(users).values({ ...u, level: levelFromXp(u.xp) });
  }

  // Bot leaderboard users
  for (let i = 0; i < NAMES.length; i++) {
    const xp = Math.floor(1000 + Math.random() * 12000);
    const high = Math.floor(3000 + Math.random() * 20000);
    await db.insert(users).values({
      username: NAMES[i],
      email: `bot${i}@puzzle.dev`,
      passwordHash: adminHash,
      country: COUNTRIES[i % COUNTRIES.length],
      avatar: AVATARS[i % AVATARS.length],
      role: "player",
      xp,
      coins: Math.floor(Math.random() * 3000),
      gems: Math.floor(Math.random() * 100),
      level: levelFromXp(xp),
      streak: Math.floor(Math.random() * 20),
      highScore: high,
      gamesPlayed: Math.floor(30 + Math.random() * 300),
      wins: Math.floor(10 + Math.random() * 200),
      bestCombo: Math.floor(4 + Math.random() * 15),
    });
  }

  // Sample scores for demo player (id likely 2)
  const [demo] = await db.select().from(users).where(sql`${users.email} = 'demo@puzzle.dev'`);
  if (demo) {
    for (let i = 0; i < 8; i++) {
      await db.insert(scores).values({
        userId: demo.id,
        score: Math.floor(1500 + Math.random() * 8000),
        lines: Math.floor(5 + Math.random() * 40),
        combo: Math.floor(2 + Math.random() * 8),
        mode: ["endless", "daily", "challenge"][i % 3],
      });
    }
  }

  // Achievements (30+)
  const ach = [
    ["First Steps", "Play your first game", "beginner", "👣", 1, 50, 0],
    ["Line Breaker", "Clear 10 lines", "clears", "🧹", 10, 100, 0],
    ["Combo Starter", "Reach a 3x combo", "combo", "⚡", 3, 100, 1],
    ["Combo Master", "Reach a 8x combo", "combo", "🔥", 8, 300, 3],
    ["Score Hunter", "Score 5,000 in one game", "score", "🎯", 5000, 200, 2],
    ["High Roller", "Score 15,000 in one game", "score", "💎", 15000, 500, 5],
    ["Daily Devotee", "Login 7 days in a row", "streak", "📅", 7, 250, 2],
    ["Marathon", "Play 100 games", "games", "🏃", 100, 400, 4],
    ["Perfectionist", "Clear a full board", "special", "✨", 1, 300, 3],
    ["Coin Collector", "Earn 1,000 coins", "economy", "🪙", 1000, 0, 5],
    ["Gem Baron", "Collect 50 gems", "economy", "💠", 50, 0, 0],
    ["Level 10", "Reach level 10", "progression", "🚀", 10, 500, 5],
    ["Level 25", "Reach level 25", "progression", "🌟", 25, 1000, 10],
    ["Speed Demon", "Clear 5 lines in 30s", "clears", "⏱️", 5, 200, 2],
    ["Night Owl", "Play after midnight", "special", "🦉", 1, 100, 1],
    ["Weekend Warrior", "Play on Sat & Sun", "special", "⚔️", 2, 150, 1],
    ["Explorer", "Try all 11 game modes", "special", "🧭", 11, 250, 3],
    ["Mine Sweeper", "Flag and clear mines in Minesweeper", "special", "💣", 1, 150, 1],
    ["Word Smith", "Crack your first secret 5-letter word", "beginner", "📝", 1, 150, 1],
    ["Water Sorter", "Sort colored test tubes successfully", "beginner", "🧪", 1, 150, 1],
    ["Pipe Connector", "Connect colored dots and cover 100% grid cells", "beginner", "🔗", 1, 150, 1],
    ["Picross Artist", "Reveal your first Nonogram pixel art silhouette", "beginner", "🎨", 1, 150, 1],
    ["Shopaholic", "Buy 5 shop items", "economy", "🛍️", 5, 0, 5],
    ["Streak Legend", "Reach a 30 day streak", "streak", "🏅", 30, 1500, 15],
    ["Tetris Fan", "Clear 4 lines at once", "clears", "🟦", 4, 400, 4],
    ["Combo God", "Reach a 12x combo", "combo", "👑", 12, 800, 8],
    ["Grand Master", "Reach level 50", "progression", "🎖️", 50, 3000, 30],
    ["Puzzle Addict", "Play 500 games", "games", "🎮", 500, 1500, 12],
    ["Daily Grinder", "Complete 50 daily missions", "missions", "📈", 50, 700, 6],
    ["First Win", "Win your first game", "beginner", "🥇", 1, 100, 1],
    ["Century", "Win 100 games", "games", "💯", 100, 900, 9],
    ["Zen Mode", "Play 1 hour total", "special", "🧘", 60, 200, 2],
    ["Comeback Kid", "Recover from near-loss", "special", "🔄", 1, 250, 2],
    ["Lucky Seven", "Score exactly with a 7x combo", "combo", "🍀", 7, 350, 3],
    ["Completionist", "Unlock 25 achievements", "meta", "🏆", 25, 2000, 20],
    ["Event Champion", "Win a live event", "events", "🎊", 1, 500, 5],
    ["Social Star", "Beat a friend's score", "social", "🌠", 1, 200, 2],
  ];
  for (const a of ach) {
    await db.insert(achievements).values({
      title: a[0] as string,
      description: a[1] as string,
      category: a[2] as string,
      icon: a[3] as string,
      target: a[4] as number,
      rewardCoins: a[5] as number,
      rewardGems: a[6] as number,
    });
  }

  // Missions
  const mis = [
    ["Warm Up", "Play 3 games today", "daily", 3, 1, 100, 50, false],
    ["Line Rush", "Clear 25 lines", "daily", 25, 12, 150, 75, false],
    ["Combo Chase", "Reach a 5x combo", "daily", 5, 5, 200, 100, true],
    ["Weekly Grind", "Play 20 games this week", "weekly", 20, 8, 500, 250, false],
    ["Score Sprint", "Score 30,000 total this week", "weekly", 30000, 12400, 600, 300, false],
    ["Monthly Master", "Win 50 games this month", "monthly", 50, 22, 1500, 800, false],
    ["Season Opener", "Earn 5,000 XP", "seasonal", 5000, 3400, 2000, 1000, false],
    ["Event Blitz", "Score 10,000 in the event", "event", 10000, 0, 800, 400, false],
  ];
  for (const m of mis) {
    await db.insert(missions).values({
      title: m[0] as string,
      description: m[1] as string,
      type: m[2] as string,
      target: m[3] as number,
      progress: m[4] as number,
      rewardXp: m[5] as number,
      rewardCoins: m[6] as number,
      completed: m[7] as boolean,
    });
  }

  // Shop items
  const shop = [
    ["Neon Nights Theme", "Glowing neon board with electric grid lines", "theme", "🌆", 800, 0, true],
    ["Ocean Breeze Theme", "Calm blue tones with wave animations", "theme", "🌊", 600, 0, false],
    ["Galaxy Theme", "Deep space background with twinkling stars", "theme", "🌌", 0, 25, true],
    ["Sunset Blocks", "Warm gradient block skins", "theme", "🌇", 500, 0, false],
    ["Confetti Effect", "Celebrate every line clear with confetti", "effect", "🎊", 300, 0, false],
    ["Lightning Trail", "Electric trail follows your blocks", "effect", "⚡", 0, 15, true],
    ["Golden Frame", "Show off with a golden profile frame", "frame", "🖼️", 1200, 0, false],
    ["Diamond Frame", "Premium diamond profile frame", "frame", "💎", 0, 40, false],
    ["Lo-Fi Music Pack", "Relaxing lo-fi beats while you play", "music", "🎵", 400, 0, false],
    ["Retro Arcade Pack", "8-bit sound effects and chiptune", "music", "🕹️", 450, 0, false],
    ["Starter Bundle", "Coins, gems and a theme to kickstart", "bundle", "📦", 0, 30, true],
    ["Pro Bundle", "Everything a pro needs to dominate", "bundle", "🎁", 0, 80, false],
  ];
  for (const s of shop) {
    await db.insert(shopItems).values({
      name: s[0] as string,
      description: s[1] as string,
      category: s[2] as string,
      icon: s[3] as string,
      priceCoins: s[4] as number,
      priceGems: s[5] as number,
      featured: s[6] as boolean,
    });
  }

  // Events
  const evs = [
    ["Weekend Frenzy", "Double XP all weekend long!", "🔥", "live"],
    ["Combo Championship", "Compete for the highest combo of the season", "🏆", "live"],
    ["Spring Puzzle Fest", "Limited-time themed puzzles and rewards", "🌸", "upcoming"],
    ["Midnight Marathon", "Endless mode challenge with bonus loot", "🌙", "upcoming"],
    ["Holiday Blast", "Festive event with exclusive cosmetics", "🎄", "ended"],
  ];
  for (const e of evs) {
    await db.insert(events).values({
      title: e[0],
      description: e[1],
      icon: e[2],
      status: e[3],
    });
  }

  // Global notifications
  await db.insert(notifications).values([
    { title: "Welcome to Puzzle Universe! 🎉", body: "Play the Grid Block Puzzle and climb the leaderboard.", type: "info" },
    { title: "Weekend Frenzy is live 🔥", body: "Earn double XP until Sunday night.", type: "event" },
    { title: "New shop items available 🛍️", body: "Check out the Galaxy theme and Lightning trail.", type: "update" },
  ]);

  return Response.json({ ok: true, seeded: true });
}
