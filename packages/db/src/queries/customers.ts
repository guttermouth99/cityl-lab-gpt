import type { CustomerPlan, CustomerStatus } from "@baito/shared";
import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { customers } from "../schema/customers";

export interface CreateCustomerInput {
  userId: string;
  organizationId: string;
  plan?: CustomerPlan;
  billingEmail?: string | null;
}

export function getCustomerById(id: string) {
  return db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      user: true,
      organization: true,
    },
  });
}

export function getCustomerByUserId(userId: string) {
  return db.query.customers.findFirst({
    where: eq(customers.userId, userId),
    with: {
      organization: true,
    },
  });
}

export function getCustomerByOrganizationId(organizationId: string) {
  return db.query.customers.findFirst({
    where: eq(customers.organizationId, organizationId),
    with: {
      user: true,
    },
  });
}

export async function createCustomer(input: CreateCustomerInput) {
  const id = crypto.randomUUID();

  const [customer] = await db
    .insert(customers)
    .values({
      id,
      userId: input.userId,
      organizationId: input.organizationId,
      plan: input.plan ?? "starter",
      billingEmail: input.billingEmail ?? null,
    })
    .returning();

  return customer;
}

export async function updateCustomerPlan(id: string, plan: CustomerPlan) {
  const planLimits: Record<CustomerPlan, number> = {
    starter: 5,
    professional: 25,
    enterprise: 100,
  };

  const [updated] = await db
    .update(customers)
    .set({
      plan,
      jobsLimit: planLimits[plan],
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  return updated;
}

export async function updateCustomerStatus(id: string, status: CustomerStatus) {
  const [updated] = await db
    .update(customers)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  return updated;
}

export async function incrementJobsUsed(id: string) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!customer) {
    return null;
  }

  const [updated] = await db
    .update(customers)
    .set({
      jobsUsed: customer.jobsUsed + 1,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  return updated;
}

export async function decrementJobsUsed(id: string) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!customer || customer.jobsUsed <= 0) {
    return null;
  }

  const [updated] = await db
    .update(customers)
    .set({
      jobsUsed: customer.jobsUsed - 1,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  return updated;
}

export async function canCustomerPostJob(id: string): Promise<boolean> {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!customer) {
    return false;
  }
  if (customer.status !== "active") {
    return false;
  }

  return customer.jobsUsed < customer.jobsLimit;
}

export async function setStripeCustomerId(
  id: string,
  stripeCustomerId: string
) {
  const [updated] = await db
    .update(customers)
    .set({
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  return updated;
}

export function getActiveCustomers() {
  return db.query.customers.findMany({
    where: eq(customers.status, "active"),
    orderBy: [desc(customers.createdAt)],
    with: {
      user: true,
      organization: true,
    },
  });
}
