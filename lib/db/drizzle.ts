import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: ".env.local" }); // or .env.local
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);
