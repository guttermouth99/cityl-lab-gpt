import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

// Enums
export const customerPlanEnum = pgEnum("customer_plan", [
  "starter",
  "professional",
  "enterprise",
]);
export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "suspended",
  "cancelled",
]);

// Customers table
export const customers = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  plan: customerPlanEnum("plan").notNull().default("starter"),
  status: customerStatusEnum("status").notNull().default("active"),
  jobsLimit: integer("jobs_limit").notNull().default(5),
  jobsUsed: integer("jobs_used").notNull().default(0),
  billingEmail: text("billing_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customersRelations = relations(customers, ({ one }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
}));
