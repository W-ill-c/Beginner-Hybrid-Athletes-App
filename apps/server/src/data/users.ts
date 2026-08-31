import { PrismaClient } from '@prisma/client'
import type { User as UserRow } from '@prisma/client'

// Real persistence via SQLite (Prisma) - the account (plus onboarding
// answers and the risk-disclaimer acknowledgement, flattened onto the same
// row) is the one piece of data that needs to survive a server restart.

export const prisma = new PrismaClient()

export interface OnboardingAnswers {
  duration: '0-30' | '31-60' | '60-90' | '90+'
  daysPerWeek: number
  activityLevel: string
  priority: 'running' | 'lifting' | 'both'
}

export interface User {
  id: string
  email: string
  password: string
  plan: 'basic' | 'premium' | null
  firstName: string
  lastName: string
  height: string
  weight: string
  onboarding: OnboardingAnswers | null
  riskAcknowledgedAt: string | null
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    plan: row.plan === 'basic' || row.plan === 'premium' ? row.plan : null,
    firstName: row.firstName,
    lastName: row.lastName,
    height: row.height,
    weight: row.weight,
    onboarding:
      row.duration !== null && row.priority !== null && row.daysPerWeek !== null
        ? {
            duration: row.duration as OnboardingAnswers['duration'],
            daysPerWeek: row.daysPerWeek,
            activityLevel: row.activityLevel ?? '',
            priority: row.priority as OnboardingAnswers['priority'],
          }
        : null,
    riskAcknowledgedAt: row.riskAcknowledgedAt ? row.riskAcknowledgedAt.toISOString() : null,
  }
}

export async function createUser(
  email: string,
  password: string,
  plan: User['plan'],
): Promise<User> {
  const row = await prisma.user.create({ data: { email: email.toLowerCase(), password, plan } })
  return toUser(row)
}

// Emails are stored lowercased (see createUser), so a lowercased lookup is
// enough for a case-insensitive match - SQLite's `mode: 'insensitive'`
// filter (available on Postgres) isn't supported here.
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  return row ? toUser(row) : undefined
}

export async function findUserById(id: string): Promise<User | undefined> {
  const row = await prisma.user.findUnique({ where: { id } })
  return row ? toUser(row) : undefined
}

export async function updateUserOnboarding(
  id: string,
  data: {
    onboarding: OnboardingAnswers
    firstName: string
    lastName: string
    height: string
    weight: string
  },
): Promise<User> {
  const row = await prisma.user.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      height: data.height,
      weight: data.weight,
      duration: data.onboarding.duration,
      daysPerWeek: data.onboarding.daysPerWeek,
      activityLevel: data.onboarding.activityLevel,
      priority: data.onboarding.priority,
    },
  })
  return toUser(row)
}

// Records that the user clicked "I Understand and Agree" on the injury-risk
// disclaimer, shown once right after onboarding finishes.
export async function acknowledgeRisk(id: string): Promise<User> {
  const row = await prisma.user.update({ where: { id }, data: { riskAcknowledgedAt: new Date() } })
  return toUser(row)
}
