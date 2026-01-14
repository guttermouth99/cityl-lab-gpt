import { typesenseClient } from '../client'
import { JOBS_COLLECTION_NAME } from '../collections/jobs'
import { ORGANIZATIONS_COLLECTION_NAME } from '../collections/organizations'

export interface AutocompleteResult {
  jobs: { id: string; title: string; slug: string; organizationName: string }[]
  organizations: { id: string; name: string; slug: string }[]
}

export async function autocomplete(query: string, limit = 5): Promise<AutocompleteResult> {
  if (!query || query.length < 2) {
    return { jobs: [], organizations: [] }
  }

  const [jobsResponse, orgsResponse] = await Promise.all([
    typesenseClient.collections(JOBS_COLLECTION_NAME).documents().search({
      q: query,
      query_by: 'title,organizationName',
      filter_by: 'status:=active',
      per_page: limit,
      prefix: true,
    }),
    typesenseClient.collections(ORGANIZATIONS_COLLECTION_NAME).documents().search({
      q: query,
      query_by: 'name',
      per_page: limit,
      prefix: true,
    }),
  ])

  const jobs =
    jobsResponse.hits?.map((hit) => ({
      id: hit.document.id as string,
      title: hit.document.title as string,
      slug: hit.document.slug as string,
      organizationName: hit.document.organizationName as string,
    })) || []

  const organizations =
    orgsResponse.hits?.map((hit) => ({
      id: hit.document.id as string,
      name: hit.document.name as string,
      slug: hit.document.slug as string,
    })) || []

  return { jobs, organizations }
}

export async function suggestJobTitles(query: string, limit = 10): Promise<string[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await typesenseClient.collections(JOBS_COLLECTION_NAME).documents().search({
    q: query,
    query_by: 'title',
    filter_by: 'status:=active',
    per_page: limit,
    prefix: true,
    group_by: 'title',
    group_limit: 1,
  })

  return response.grouped_hits?.map((group) => group.hits[0]?.document.title as string) || []
}
