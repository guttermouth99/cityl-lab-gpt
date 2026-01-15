import type { AlertFrequency } from "@baito/shared";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../client";
import { type AlertFilters, alerts, sentJobs } from "../schema/alerts";
import { users } from "../schema/users";

export function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
}

export function getUserWithAlerts(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      // Note: we need to define this relation in schema
    },
  });
}

export async function updateUserAlertFrequency(
  userId: string,
  frequency: AlertFrequency
) {
  const [updated] = await db
    .update(users)
    .set({
      alertFrequency: frequency,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

export async function updateUserRole(
  userId: string,
  role: "user" | "customer" | "admin"
) {
  const [updated] = await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

// Alert queries
export function getUserAlerts(userId: string) {
  return db.query.alerts.findMany({
    where: eq(alerts.userId, userId),
    orderBy: [desc(alerts.createdAt)],
  });
}

export async function createAlert(input: {
  userId: string;
  name: string;
  filters?: AlertFilters;
}) {
  const id = crypto.randomUUID();

  const [alert] = await db
    .insert(alerts)
    .values({
      id,
      userId: input.userId,
      name: input.name,
      filters: input.filters ?? {},
    })
    .returning();

  return alert;
}

export async function updateAlert(
  id: string,
  input: { name?: string; filters?: AlertFilters; isActive?: boolean }
) {
  const [updated] = await db
    .update(alerts)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(alerts.id, id))
    .returning();

  return updated;
}

export async function deleteAlert(id: string) {
  await db.delete(alerts).where(eq(alerts.id, id));
}

// Track sent jobs
export async function markJobAsSent(
  userId: string,
  jobId: string,
  alertId?: string | null
) {
  const id = crypto.randomUUID();

  await db.insert(sentJobs).values({
    id,
    userId,
    jobId,
    alertId: alertId ?? null,
  });
}

export async function hasJobBeenSentToUser(userId: string, jobId: string) {
  const result = await db.query.sentJobs.findFirst({
    where: and(eq(sentJobs.userId, userId), eq(sentJobs.jobId, jobId)),
  });

  return !!result;
}

// Get users who need alerts
export function getUsersForDailyAlerts() {
  return db.query.users.findMany({
    where: eq(users.alertFrequency, "daily"),
  });
}

export function getUsersForWeeklyAlerts() {
  return db.query.users.findMany({
    where: eq(users.alertFrequency, "weekly"),
  });
}
