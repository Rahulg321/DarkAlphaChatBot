import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";
import { user } from "./schema";
import { config } from "dotenv";
import * as schema from "./schema";
import { reset } from "drizzle-seed";
import { faker } from "@faker-js/faker";
import postgres from "postgres";

config({ path: ".env.local" }); // or .env.local
async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL is not defined");
  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client);
  const start = Date.now();

  console.log("⏳ Resetting Database...");
  await reset(db, schema);
  console.log("✅ Successfully reset database");

  console.log("⏳ Running seed file...");
  console.log("Database URL:", process.env.POSTGRES_URL);
  await seed(db, schema).refine((f) => ({
    user: {
      count: 20,
    },
    deal: {
      count: 30,
      columns: {
        dealCaption: f.loremIpsum({
          sentencesCount: 2,
        }),
        dealType: f.valuesFromArray({
          values: ["SCRAPED", "MANUAL", "AI_INFERRED"],
        }),
        industry: f.valuesFromArray({
          values: ["HEALTHCARE", "TECHNOLOGY", "FINANCE", "RETAIL"],
        }),
        brokerage: f.valuesFromArray({
          values: [
            "American Healthcare Capital",
            "Indeed",
            "Deals Shop",
            "Bitrix24",
          ],
        }),
        firstName: f.firstName(),
        lastName: f.lastName(),
        linkedinUrl: f.default({ defaultValue: () => faker.internet.url() }),
        sourceWebsite: f.default({ defaultValue: () => faker.internet.url() }),
        email: f.email(),
        revenue: f.int({ minValue: 1000, maxValue: 1000000 }),
        ebitda: f.int({ minValue: 1000, maxValue: 1000000 }),
        grossRevenue: f.int({ minValue: 1000, maxValue: 1000000 }),
        askingPrice: f.int({ minValue: 1000, maxValue: 1000000 }),
        ebitdaMargin: f.int({ minValue: 10, maxValue: 100 }),
        title: f.companyName(),
        companyLocation: f.state(),
        workPhone: f.phoneNumber({ template: "(###) ###-####" }),
      },
    },
  }));

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ seeding failed");
  console.error(err);
  process.exit(1);
});
