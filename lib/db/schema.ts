import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  pgEnum,
  numeric,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// command to run a docker for connecting postgres
// docker run -d -e POSTGRES_DB=mydb -e POSTGRES_PASSWORD=testpass123 -e POSTGRES_USER=postgres -p "6500:5432" postgres

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);
export const dealTypeEnum = pgEnum("deal_type", [
  "SCRAPED",
  "MANUAL",
  "AI_INFERRED",
]);
export const simStatusEnum = pgEnum("sim_status", ["IN_PROGRESS", "COMPLETED"]);
export const sentimentEnum = pgEnum("sentiment", [
  "POSITIVE",
  "NEUTRAL",
  "NEGATIVE",
]);

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type Message = InferSelectModel<typeof message>;
// Todo table
export const todo = pgTable("todo", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull().unique(),
});

export type Todo = InferSelectModel<typeof todo>;

export const vote = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

// Deal table
export const deal = pgTable(
  "deal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brokerage: varchar("brokerage", { length: 255 }).notNull(),
    firstName: varchar("firstName", { length: 255 }),
    lastName: varchar("lastName", { length: 255 }),
    email: varchar("email", { length: 255 }),
    linkedinUrl: varchar("linkedinUrl", { length: 255 }),
    workPhone: varchar("workPhone", { length: 255 }),
    dealCaption: text("dealCaption"),
    revenue: numeric("revenue"),
    ebitda: numeric("ebitda"),
    title: varchar("title", { length: 255 }),
    grossRevenue: numeric("grossRevenue"),
    askingPrice: numeric("askingPrice"),
    ebitdaMargin: numeric("ebitdaMargin"),
    industry: varchar("industry", { length: 255 }),
    dealType: dealTypeEnum("dealType").default("MANUAL").notNull(),
    sourceWebsite: varchar("sourceWebsite", { length: 255 }).notNull(),
    companyLocation: varchar("companyLocation", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueDeal: unique().on(table.brokerage, table.title, table.industry),
    };
  }
);

export type Deal = InferSelectModel<typeof deal>;

// Sim table
export const sim = pgTable("sim", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  caption: varchar("caption", { length: 255 }).notNull(),
  status: simStatusEnum("status").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
  dealId: uuid("dealId")
    .notNull()
    .references(() => deal.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Sim = InferSelectModel<typeof sim>;

// AI Screening table
export const aiScreening = pgTable("ai_screening", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("dealId")
    .notNull()
    .references(() => deal.id),
  title: varchar("title", { length: 255 }).notNull(),
  explanation: text("explanation").notNull(),
  sentiment: sentimentEnum("sentiment").default("NEUTRAL").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AiScreening = InferSelectModel<typeof aiScreening>;

// Questionnaire table
export const questionnaire = pgTable("questionnaires", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  version: varchar("version", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type Questionnaire = InferSelectModel<typeof questionnaire>;

// Questionnaire table
export const teamMember = pgTable(
  "teamMember",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    first_name: varchar("first_name", { length: 255 }),
    last_name: varchar("last_name", { length: 255 }),
    designation: varchar("designation", { length: 255 }),
    linkedin_url: varchar("linkedin_url", { length: 255 }),
    company_url: varchar("company_url", { length: 255 }),
    company_name: varchar("company_name", { length: 255 }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint on first_name, last_name, and company_name
    uniqueNameCompany: uniqueIndex("unique_name_company").on(
      table.first_name,
      table.last_name,
      table.company_name
    ),
  })
);

export type TeamMember = InferSelectModel<typeof teamMember>;
