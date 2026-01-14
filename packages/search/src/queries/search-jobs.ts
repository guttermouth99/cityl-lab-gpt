import type { SearchResponse } from "typesense/lib/Typesense/Documents";
import { typesenseClient } from "../client";
import { JOBS_COLLECTION_NAME, type JobDocument } from "../collections/jobs";

export interface SearchJobsParams {
  query: string;
  filters?: {
    jobType?: string[];
    jobBranch?: string[];
    remoteType?: string[];
    experienceLevel?: string[];
    organizationId?: string;
    cities?: string[];
    countries?: string[];
  };
  page?: number;
  perPage?: number;
  sortBy?: "relevance" | "newest" | "boosted";
}

export interface SearchJobsResult {
  jobs: JobDocument[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    jobType: { value: string; count: number }[];
    jobBranch: { value: string; count: number }[];
    remoteType: { value: string; count: number }[];
    experienceLevel: { value: string; count: number }[];
    cities: { value: string; count: number }[];
    countries: { value: string; count: number }[];
  };
}

export async function searchJobs(
  params: SearchJobsParams
): Promise<SearchJobsResult> {
  const {
    query,
    filters = {},
    page = 1,
    perPage = 20,
    sortBy = "relevance",
  } = params;

  // Build filter string
  const filterParts: string[] = ["status:=active"];

  if (filters.jobType?.length) {
    filterParts.push(`jobType:[${filters.jobType.join(",")}]`);
  }
  if (filters.jobBranch?.length) {
    filterParts.push(`jobBranch:[${filters.jobBranch.join(",")}]`);
  }
  if (filters.remoteType?.length) {
    filterParts.push(`remoteType:[${filters.remoteType.join(",")}]`);
  }
  if (filters.experienceLevel?.length) {
    filterParts.push(`experienceLevel:[${filters.experienceLevel.join(",")}]`);
  }
  if (filters.organizationId) {
    filterParts.push(`organizationId:=${filters.organizationId}`);
  }
  if (filters.cities?.length) {
    filterParts.push(`cities:[${filters.cities.join(",")}]`);
  }
  if (filters.countries?.length) {
    filterParts.push(`countries:[${filters.countries.join(",")}]`);
  }

  // Determine sort order
  let sortByField = "_text_match:desc,createdAt:desc";
  if (sortBy === "newest") {
    sortByField = "createdAt:desc";
  } else if (sortBy === "boosted") {
    sortByField = "boostCount:desc,createdAt:desc";
  }

  const searchResponse: SearchResponse<JobDocument> = await typesenseClient
    .collections(JOBS_COLLECTION_NAME)
    .documents()
    .search({
      q: query || "*",
      query_by: "title,description,organizationName",
      filter_by: filterParts.join(" && "),
      sort_by: sortByField,
      page,
      per_page: perPage,
      facet_by: "jobType,jobBranch,remoteType,experienceLevel,cities,countries",
      max_facet_values: 50,
    });

  const jobs = searchResponse.hits?.map((hit) => hit.document) || [];
  const total = searchResponse.found || 0;

  // Extract facets
  const facets = {
    jobType: extractFacetCounts(searchResponse, "jobType"),
    jobBranch: extractFacetCounts(searchResponse, "jobBranch"),
    remoteType: extractFacetCounts(searchResponse, "remoteType"),
    experienceLevel: extractFacetCounts(searchResponse, "experienceLevel"),
    cities: extractFacetCounts(searchResponse, "cities"),
    countries: extractFacetCounts(searchResponse, "countries"),
  };

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
    facets,
  };
}

function extractFacetCounts(
  response: SearchResponse<JobDocument>,
  fieldName: string
): { value: string; count: number }[] {
  const facetCounts = response.facet_counts?.find(
    (f) => f.field_name === fieldName
  );
  if (!facetCounts) return [];

  return facetCounts.counts.map((c) => ({
    value: c.value,
    count: c.count,
  }));
}
