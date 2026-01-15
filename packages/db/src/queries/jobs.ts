import type { JobSource, JobStatus } from "@baito/shared";
import { computeContentHashSync, generateJobSlug } from "@baito/shared";
import { and, desc, eq, ilike, lt, or, sql } from "drizzle-orm";
import { db } from "../client";
import { jobs } from "../schema/jobs";
import { organizations } from "../schema/organizations";

export interface CreateJobInput {
  organizationId: string;
  title: string;
  description: string;
  externalId?: string | null;
  source?: JobSource;
  sourceFeed?: string | null;
  jobType?: string | null;
  jobBranch?: string | null;
  remoteType?: string | null;
  experienceLevel?: string | null;
  packageType?: string | null;
  expiresAt?: Date | null;
}

export interface JobFilters {
  status?: JobStatus;
  source?: JobSource;
  organizationId?: string;
  jobType?: string;
  jobBranch?: string;
  remoteType?: string;
  experienceLevel?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export function getJobById(id: string) {
  return db.query.jobs.findFirst({
    where: eq(jobs.id, id),
    with: {
      organization: true,
      locations: true,
    },
  });
}

export function getJobBySlug(slug: string) {
  return db.query.jobs.findFirst({
    where: eq(jobs.slug, slug),
    with: {
      organization: true,
      locations: true,
    },
  });
}

export function getJobsByOrganization(organizationId: string, limit = 50) {
  return db.query.jobs.findMany({
    where: eq(jobs.organizationId, organizationId),
    orderBy: [desc(jobs.createdAt)],
    limit,
    with: {
      locations: true,
    },
  });
}

export function getActiveJobs(filters: JobFilters = {}) {
  const conditions = [eq(jobs.status, "active")];

  if (filters.organizationId) {
    conditions.push(eq(jobs.organizationId, filters.organizationId));
  }
  if (filters.source) {
    conditions.push(eq(jobs.source, filters.source));
  }
  if (filters.jobType) {
    conditions.push(
      eq(
        jobs.jobType,
        filters.jobType as (typeof jobs.jobType.enumValues)[number]
      )
    );
  }
  if (filters.jobBranch) {
    conditions.push(
      eq(
        jobs.jobBranch,
        filters.jobBranch as (typeof jobs.jobBranch.enumValues)[number]
      )
    );
  }
  if (filters.remoteType) {
    conditions.push(
      eq(
        jobs.remoteType,
        filters.remoteType as (typeof jobs.remoteType.enumValues)[number]
      )
    );
  }
  if (filters.experienceLevel) {
    conditions.push(
      eq(
        jobs.experienceLevel,
        filters.experienceLevel as (typeof jobs.experienceLevel.enumValues)[number]
      )
    );
  }
  if (filters.search) {
    const searchCondition = or(
      ilike(jobs.title, `%${filters.search}%`),
      ilike(jobs.description, `%${filters.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return db.query.jobs.findMany({
    where: and(...conditions),
    orderBy: [desc(jobs.boostedAt), desc(jobs.createdAt)],
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
    with: {
      organization: true,
      locations: true,
    },
  });
}

export async function createJob(input: CreateJobInput) {
  const id = crypto.randomUUID();

  // Get organization for slug generation
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, input.organizationId),
  });

  const slug = generateJobSlug(input.title, org?.name ?? "unknown");
  const contentHash = computeContentHashSync(
    `${input.title}|${input.description}|${input.organizationId}`
  );

  const [job] = await db
    .insert(jobs)
    .values({
      id,
      slug,
      contentHash,
      organizationId: input.organizationId,
      title: input.title,
      description: input.description,
      externalId: input.externalId ?? null,
      source: input.source ?? "organic",
      sourceFeed: input.sourceFeed ?? null,
      jobType: input.jobType as
        | (typeof jobs.jobType.enumValues)[number]
        | undefined,
      jobBranch: input.jobBranch as
        | (typeof jobs.jobBranch.enumValues)[number]
        | undefined,
      remoteType: input.remoteType as
        | (typeof jobs.remoteType.enumValues)[number]
        | undefined,
      experienceLevel: input.experienceLevel as
        | (typeof jobs.experienceLevel.enumValues)[number]
        | undefined,
      packageType: input.packageType as
        | (typeof jobs.packageType.enumValues)[number]
        | undefined,
      expiresAt: input.expiresAt ?? null,
    })
    .returning();

  return job;
}

export async function updateJobStatus(id: string, status: JobStatus) {
  const [updated] = await db
    .update(jobs)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobs.id, id))
    .returning();

  return updated;
}

export function findDuplicateJob(contentHash: string, organizationId: string) {
  return db.query.jobs.findFirst({
    where: and(
      eq(jobs.contentHash, contentHash),
      eq(jobs.organizationId, organizationId)
    ),
  });
}

export async function expireOldJobs(olderThan: Date) {
  const [result] = await db
    .update(jobs)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(jobs.status, "active"), lt(jobs.expiresAt, olderThan)))
    .returning({ id: jobs.id });

  return result;
}

export async function getExpiredJobsCount() {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(and(eq(jobs.status, "active"), lt(jobs.expiresAt, new Date())));

  return result[0]?.count ?? 0;
}
