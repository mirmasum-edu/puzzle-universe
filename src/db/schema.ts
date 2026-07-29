import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 60 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  country: varchar("country", { length: 60 }).default("US").notNull(),
  avatar: text("avatar").default("🦊").notNull(),
  role: varchar("role", { length: 20 }).default("player").notNull(),
  xp: integer("xp").default(0).notNull(),
  coins: integer("coins").default(500).notNull(),
  gems: integer("gems").default(20).notNull(),
  level: integer("level").default(1).notNull(),
  streak: integer("streak").default(0).notNull(),
  highScore: integer("high_score").default(0).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
  bestCombo: integer("best_combo").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  lines: integer("lines").default(0).notNull(),
  combo: integer("combo").default(0).notNull(),
  mode: varchar("mode", { length: 30 }).default("endless").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 40 }).default("general").notNull(),
  icon: varchar("icon", { length: 12 }).default("🏆").notNull(),
  target: integer("target").default(1).notNull(),
  rewardCoins: integer("reward_coins").default(50).notNull(),
  rewardGems: integer("reward_gems").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).default("daily").notNull(),
  target: integer("target").default(1).notNull(),
  progress: integer("progress").default(0).notNull(),
  rewardXp: integer("reward_xp").default(100).notNull(),
  rewardCoins: integer("reward_coins").default(50).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 40 }).default("theme").notNull(),
  icon: varchar("icon", { length: 12 }).default("🎨").notNull(),
  priceCoins: integer("price_coins").default(0).notNull(),
  priceGems: integer("price_gems").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 30 }).default("info").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 12 }).default("🎉").notNull(),
  status: varchar("status", { length: 20 }).default("live").notNull(),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
