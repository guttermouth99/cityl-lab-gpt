import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import { typesenseClient } from "../client";

export const JOBS_COLLECTION_NAME = "jobs";

export const jobsCollectionSchema: CollectionCreateSchema = {
  name: JOBS_COLLECTION_NAME,
  fields: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "description", type: "string" },
    { name: "slug", type: "string" },
    { name: "organizationId", type: "string", facet: true },
    { name: "organizationName", type: "string", facet: true },
    { name: "organizationSlug", type: "string" },
    { name: "source", type: "string", facet: true },
    { name: "status", type: "string", facet: true },
    { name: "jobType", type: "string", facet: true, optional: true },
    { name: "jobBranch", type: "string", facet: true, optional: true },
    { name: "remoteType", type: "string", facet: true, optional: true },
    { name: "experienceLevel", type: "string", facet: true, optional: true },
    { name: "locations", type: "string[]", facet: true, optional: true },
    { name: "cities", type: "string[]", facet: true, optional: true },
    { name: "countries", type: "string[]", facet: true, optional: true },
    { name: "boostCount", type: "int32", sort: true },
    { name: "createdAt", type: "int64", sort: true },
    { name: "expiresAt", type: "int64", optional: true },
  ],
  default_sorting_field: "createdAt",
};

export interface JobDocument {
  id: string;
  title: string;
  description: string;
  slug: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  source: string;
  status: string;
  jobType?: string;
  jobBranch?: string;
  remoteType?: string;
  experienceLevel?: string;
  locations?: string[];
  cities?: string[];
  countries?: string[];
  boostCount: number;
  createdAt: number;
  expiresAt?: number;
}

export async function createJobsCollection() {
  try {
    await typesenseClient.collections(JOBS_COLLECTION_NAME).retrieve();
    console.log("Jobs collection already exists");
  } catch {
    await typesenseClient.collections().create(jobsCollectionSchema);
    console.log("Jobs collection created");
  }
}

export function indexJob(job: JobDocument) {
  return typesenseClient
    .collections(JOBS_COLLECTION_NAME)
    .documents()
    .upsert(job);
}

export function indexJobs(jobs: JobDocument[]) {
  return typesenseClient
    .collections(JOBS_COLLECTION_NAME)
    .documents()
    .import(jobs, { action: "upsert" });
}

export function deleteJobFromIndex(id: string) {
  return typesenseClient
    .collections(JOBS_COLLECTION_NAME)
    .documents(id)
    .delete();
}
