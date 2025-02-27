CREATE TABLE IF NOT EXISTS "teamMember" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"designation" varchar(255),
	"linkedin_url" varchar(255),
	"company_url" varchar(255),
	"company_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
