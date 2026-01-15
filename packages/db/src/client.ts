import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  accounts,
  accountsRelations,
  alerts,
  alertsRelations,
  customers,
  customersRelations,
  jobLocations,
  jobLocationsRelations,
  jobs,
  jobsRelations,
  organizations,
  organizationsRelations,
  sentJobs,
  sentJobsRelations,
  sessions,
  sessionsRelations,
  users,
  usersRelations,
  verifications,
} from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const schema = {
  accounts,
  accountsRelations,
  alerts,
  alertsRelations,
  customers,
  customersRelations,
  jobLocations,
  jobLocationsRelations,
  jobs,
  jobsRelations,
  organizations,
  organizationsRelations,
  sentJobs,
  sentJobsRelations,
  sessions,
  sessionsRelations,
  users,
  usersRelations,
  verifications,
};

// Connection for queries
const queryClient = postgres(connectionString);

// Connection for migrations (with max 1 connection)
export const migrationClient = postgres(connectionString, { max: 1 });

export const db = drizzle(queryClient, { schema });

export type DB = typeof db;
