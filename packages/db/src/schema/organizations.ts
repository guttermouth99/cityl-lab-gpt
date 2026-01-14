import { relations } from "drizzle-orm";
import { boolean, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { jobs } from "./jobs";

export const organizations = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  url: text("url"),
  domain: text("domain").unique(),
  isImpact: boolean("is_impact").notNull().default(false),
  isBlacklisted: boolean("is_blacklisted").notNull().default(false),
  careerPageUrl: text("career_page_url"),
  embedding: real("embedding").array(),
  contentHash: text("content_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  jobs: many(jobs),
  customers: many(customers),
}));
