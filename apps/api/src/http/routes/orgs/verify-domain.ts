import dns from 'dns'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function verifyDomain(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organization/verify-domain',
      {
        schema: {
          tags: ['organization'],
          summary: 'Verify a organization domain in DNS',
          security: [{ bearerAuth: [] }],
          body: z.object({
            organizationId: z.string(),
          }),
          response: {
            201: z.object({
              message: z.string(),
            }),
            400: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationId } = request.body

        const organization = await prisma.organization.findUnique({
          where: { id: organizationId },
        })

        if (!organization) {
          throw new BadRequestError('Organizations does not exists.')
        }

        const member = await prisma.member.findFirst({
          where: { userId, organizationId, role: 'ADMIN' },
        })

        if (!member) {
          throw new UnauthorizedError(
            'The user must be an organization administrator to verify a domain.',
          )
        }

        if (!organization.domain) {
          throw new BadRequestError('Organization do not have a domain.')
        }

        dns.resolveTxt(`_saas.${organization.domain}`, async (err, records) => {
          if (err) {
            console.error(`Error verifying DNS by ${organization.name}`, err)
            throw new BadRequestError('Error verifying DNS.')
          }

          const isVerified = records.some((record) =>
            record.includes(String(organization.domainToken)),
          )
          if (isVerified) {
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                verifiedDomain: true,
              },
            })

            return reply
              .status(201)
              .send({ message: 'Domain verified successfully' })
          } else {
            return reply
              .status(400)
              .send({ message: 'Domain verification failed' })
          }
        })
      },
    )
}
