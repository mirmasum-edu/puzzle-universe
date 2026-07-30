CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(40) DEFAULT 'general' NOT NULL,
	"icon" varchar(12) DEFAULT '🏆' NOT NULL,
	"target" integer DEFAULT 1 NOT NULL,
	"reward_coins" integer DEFAULT 50 NOT NULL,
	"reward_gems" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(12) DEFAULT '🎉' NOT NULL,
	"status" varchar(20) DEFAULT 'live' NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"ends_at" timestamp,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(20) DEFAULT 'daily' NOT NULL,
	"target" integer DEFAULT 1 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"reward_xp" integer DEFAULT 100 NOT NULL,
	"reward_coins" integer DEFAULT 50 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"type" varchar(30) DEFAULT 'info' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"score" integer NOT NULL,
	"lines" integer DEFAULT 0 NOT NULL,
	"combo" integer DEFAULT 0 NOT NULL,
	"mode" varchar(30) DEFAULT 'endless' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(40) DEFAULT 'theme' NOT NULL,
	"icon" varchar(12) DEFAULT '🎨' NOT NULL,
	"price_coins" integer DEFAULT 0 NOT NULL,
	"price_gems" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(60) NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"country" varchar(60) DEFAULT 'US' NOT NULL,
	"avatar" text DEFAULT '🦊' NOT NULL,
	"role" varchar(20) DEFAULT 'player' NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 500 NOT NULL,
	"gems" integer DEFAULT 20 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"high_score" integer DEFAULT 0 NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"best_combo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
