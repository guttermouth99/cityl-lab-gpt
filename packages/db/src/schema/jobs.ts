import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

// Enums
export const jobSourceEnum = pgEnum("job_source", [
  "organic",
  "paid",
  "cpa",
  "flatrate",
  "agency",
  "scraped",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "pending",
  "active",
  "expired",
  "archived",
]);
export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
  "volunteer",
  "apprenticeship",
]);
export const jobBranchEnum = pgEnum("job_branch", [
  "social",
  "environment",
  "health",
  "education",
  "human_rights",
  "development",
  "sustainability",
  "nonprofit",
  "governance",
  "research",
  "communications",
  "technology",
  "finance",
  "operations",
  "other",
]);
export const remoteTypeEnum = pgEnum("remote_type", [
  "onsite",
  "remote",
  "hybrid",
]);
export const experienceLevelEnum = pgEnum("experience_level", [
  "entry",
  "junior",
  "mid",
  "senior",
  "lead",
  "executive",
]);
export const packageTypeEnum = pgEnum("package_type", [
  "basic",
  "standard",
  "premium",
  "featured",
]);

export const jobs = pgTable("job", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  externalId: text("external_id"),
  source: jobSourceEnum("source").notNull().default("organic"),
  sourceFeed: text("source_feed"),
  contentHash: text("content_hash").notNull(),
  status: jobStatusEnum("status").notNull().default("pending"),
  jobType: jobTypeEnum("job_type"),
  jobBranch: jobBranchEnum("job_branch"),
  remoteType: remoteTypeEnum("remote_type"),
  experienceLevel: experienceLevelEnum("experience_level"),
  packageType: packageTypeEnum("package_type"),
  boostCount: integer("boost_count").notNull().default(0),
  boostedAt: timestamp("boosted_at"),
  expiresAt: timestamp("expires_at"),
  embedding: real("embedding").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobs.organizationId],
    references: [organizations.id],
  }),
  locations: many(jobLocations),
}));

// Job Locations
export const jobLocations = pgTable("job_location", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  city: text("city"),
  state: text("state"),
  country: text("country").notNull(),
  postalCode: text("postal_code"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const jobLocationsRelations = relations(jobLocations, ({ one }) => ({
  job: one(jobs, {
    fields: [jobLocations.jobId],
    references: [jobs.id],
  }),
}));
