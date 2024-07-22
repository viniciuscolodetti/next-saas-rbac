import { api } from './api-client'

interface GetOrganizationResponse {
  organization: {
    id: string
    name: string
    slug: string
    domain: string | null
    shouldAttachUsersByDomain: boolean
    avatarUrl: string | null
    createdAt: string
    updatedAt: string
    domainToken: string | null
    verifiedDomain: boolean
    ownerId: string
  }
}

export async function getOrganization(org: string) {
  const result = await api
    .get(`organizations/${org}`)
    .json<GetOrganizationResponse>()

  return result
}
