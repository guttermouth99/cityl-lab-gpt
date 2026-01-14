import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import { typesenseClient } from '../client'

export const ORGANIZATIONS_COLLECTION_NAME = 'organizations'

export const organizationsCollectionSchema: CollectionCreateSchema = {
  name: ORGANIZATIONS_COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'domain', type: 'string', optional: true },
    { name: 'url', type: 'string', optional: true },
    { name: 'isImpact', type: 'bool', facet: true },
    { name: 'jobCount', type: 'int32', sort: true },
    { name: 'createdAt', type: 'int64', sort: true },
  ],
  default_sorting_field: 'jobCount',
}

export interface OrganizationDocument {
  id: string
  name: string
  slug: string
  domain?: string
  url?: string
  isImpact: boolean
  jobCount: number
  createdAt: number
}

export async function createOrganizationsCollection() {
  try {
    await typesenseClient.collections(ORGANIZATIONS_COLLECTION_NAME).retrieve()
    console.log('Organizations collection already exists')
  } catch {
    await typesenseClient.collections().create(organizationsCollectionSchema)
    console.log('Organizations collection created')
  }
}

export async function indexOrganization(org: OrganizationDocument) {
  return typesenseClient
    .collections(ORGANIZATIONS_COLLECTION_NAME)
    .documents()
    .upsert(org)
}

export async function indexOrganizations(orgs: OrganizationDocument[]) {
  return typesenseClient
    .collections(ORGANIZATIONS_COLLECTION_NAME)
    .documents()
    .import(orgs, { action: 'upsert' })
}

export async function deleteOrganizationFromIndex(id: string) {
  return typesenseClient
    .collections(ORGANIZATIONS_COLLECTION_NAME)
    .documents(id)
    .delete()
}
