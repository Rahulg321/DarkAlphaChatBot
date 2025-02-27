ALTER TABLE "deal" ALTER COLUMN "dealCaption" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deal" ALTER COLUMN "revenue" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deal" ALTER COLUMN "ebitda" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deal" ALTER COLUMN "ebitdaMargin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deal" ALTER COLUMN "industry" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_name_company" ON "teamMember" USING btree ("first_name","last_name","company_name");