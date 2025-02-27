DO $$ BEGIN
 CREATE TYPE "public"."deal_type" AS ENUM('SCRAPED', 'MANUAL', 'AI_INFERRED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sentiment" AS ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sim_status" AS ENUM('IN_PROGRESS', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_screening" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"explanation" text NOT NULL,
	"sentiment" "sentiment" DEFAULT 'NEUTRAL' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brokerage" varchar(255) NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255),
	"email" varchar(255),
	"linkedinUrl" varchar(255),
	"workPhone" varchar(255),
	"dealCaption" text NOT NULL,
	"revenue" numeric NOT NULL,
	"ebitda" numeric NOT NULL,
	"title" varchar(255),
	"grossRevenue" numeric,
	"askingPrice" numeric,
	"ebitdaMargin" numeric NOT NULL,
	"industry" varchar(255) NOT NULL,
	"dealType" "deal_type" DEFAULT 'MANUAL' NOT NULL,
	"sourceWebsite" varchar(255) NOT NULL,
	"companyLocation" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deal_brokerage_title_industry_unique" UNIQUE("brokerage","title","industry")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileUrl" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"purpose" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"version" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"caption" varchar(255) NOT NULL,
	"status" "sim_status" NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileType" varchar(255) NOT NULL,
	"fileUrl" varchar(255) NOT NULL,
	"dealId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "todo_text_unique" UNIQUE("text")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_screening" ADD CONSTRAINT "ai_screening_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sim" ADD CONSTRAINT "sim_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
