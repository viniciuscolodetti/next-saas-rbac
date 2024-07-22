import type { Role } from '@saas/auth'

import { api } from './api-client'

interface GetInvitesResponse {
  invites: {
    id: string
    role: Role
    email: string
    createdAt: string
    author: {
      name: string | null
      id: string
    } | null
  }[]
}

export async function getInvites(org: string) {
  const result = await api
    .get(`organizations/${org}/invites`, { next: { tags: [`${org}/invites`] } })
    .json<GetInvitesResponse>()

  return result
}
