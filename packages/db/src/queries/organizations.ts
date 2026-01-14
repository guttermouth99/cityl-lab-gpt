import {
  extractDomain,
  generateOrgSlug,
  normalizeOrgName,
} from "@baito/shared";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../client";
import { organizations } from "../schema/organizations";

export interface CreateOrganizationInput {
  name: string;
  url?: string | null;
  domain?: string | null;
  isImpact?: boolean;
  careerPageUrl?: string | null;
}

export interface UpdateOrganizationInput {
  name?: string;
  url?: string | null;
  domain?: string | null;
  isImpact?: boolean;
  isBlacklisted?: boolean;
  careerPageUrl?: string | null;
  contentHash?: string | null;
}

export async function getOrganizationById(id: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.id, id),
    with: {
      jobs: {
        limit: 10,
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
      },
    },
  });
}

export async function getOrganizationBySlug(slug: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
    with: {
      jobs: {
        where: (jobs, { eq }) => eq(jobs.status, "active"),
        limit: 50,
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
      },
    },
  });
}

export async function findOrgByDomain(domain: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.domain, domain.toLowerCase()),
  });
}

export async function findOrgByName(name: string) {
  const normalized = normalizeOrgName(name);

  return db.query.organizations.findFirst({
    where: ilike(organizations.name, `%${normalized}%`),
  });
}

export async function findOrMatchOrganization(input: {
  name: string;
  url?: string | null;
}): Promise<typeof organizations.$inferSelect | null> {
  // First, try to find by domain if URL is provided
  if (input.url) {
    const domain = extractDomain(input.url);
    if (domain) {
      const byDomain = await findOrgByDomain(domain);
      if (byDomain) return byDomain;
    }
  }

  // Then try to find by name
  const byName = await findOrgByName(input.name);
  if (byName) return byName;

  return null;
}

export async function createOrganization(input: CreateOrganizationInput) {
  const id = crypto.randomUUID();
  const slug = generateOrgSlug(input.name);
  const domain = input.domain ?? (input.url ? extractDomain(input.url) : null);

  const [org] = await db
    .insert(organizations)
    .values({
      id,
      slug,
      name: input.name,
      url: input.url ?? null,
      domain,
      isImpact: input.isImpact ?? false,
      careerPageUrl: input.careerPageUrl ?? null,
    })
    .returning();

  return org;
}

export async function updateOrganization(
  id: string,
  input: UpdateOrganizationInput
) {
  const [updated] = await db
    .update(organizations)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();

  return updated;
}

export async function getImpactOrganizations(limit = 100) {
  return db.query.organizations.findMany({
    where: and(
      eq(organizations.isImpact, true),
      eq(organizations.isBlacklisted, false)
    ),
    orderBy: [desc(organizations.createdAt)],
    limit,
  });
}

export async function searchOrganizations(query: string, limit = 20) {
  return db.query.organizations.findMany({
    where: and(
      eq(organizations.isBlacklisted, false),
      or(
        ilike(organizations.name, `%${query}%`),
        ilike(organizations.domain, `%${query}%`)
      )
    ),
    limit,
  });
}

export async function getOrganizationsCount() {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(organizations)
    .where(eq(organizations.isBlacklisted, false));

  return result[0]?.count ?? 0;
}
