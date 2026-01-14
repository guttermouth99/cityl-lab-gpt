import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Connection for queries
const queryClient = postgres(connectionString);

// Connection for migrations (with max 1 connection)
export const migrationClient = postgres(connectionString, { max: 1 });

export const db = drizzle(queryClient, { schema });

export type DB = typeof db;
