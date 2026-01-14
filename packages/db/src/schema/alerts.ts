import { pgTable, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { jobs } from './jobs'

// Alert filters type
export interface AlertFilters {
  keywords?: string[]
  jobTypes?: string[]
  jobBranches?: string[]
  remoteTypes?: string[]
  experienceLevels?: string[]
  locations?: string[]
  organizations?: string[]
}

// Alerts table
export const alerts = pgTable('alert', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  filters: jsonb('filters').$type<AlertFilters>().notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  sentJobs: many(sentJobs),
}))

// Sent Jobs - track which jobs were sent to which users
export const sentJobs = pgTable('sent_job', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  alertId: text('alert_id').references(() => alerts.id, { onDelete: 'set null' }),
  sentAt: timestamp('sent_at').notNull().defaultNow(),
})

export const sentJobsRelations = relations(sentJobs, ({ one }) => ({
  user: one(users, {
    fields: [sentJobs.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [sentJobs.jobId],
    references: [jobs.id],
  }),
  alert: one(alerts, {
    fields: [sentJobs.alertId],
    references: [alerts.id],
  }),
}))
