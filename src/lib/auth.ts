import { NextAuthOptions, getServerSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Ungültige Anmeldedaten')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.hashedPassword) {
          throw new Error('Ungültige Anmeldedaten')
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          throw new Error('Ungültige Anmeldedaten')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Create default team for new users
      if (account?.provider === 'google' || account?.provider === 'credentials') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
          include: { ownedTeams: true },
        })

        if (existingUser && existingUser.ownedTeams.length === 0) {
          await createDefaultTeam(existingUser.id, existingUser.name || 'Mein Team')
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
      }

      if (trigger === 'update' && session) {
        token.name = session.name
      }

      // Fetch current team
      if (token.id) {
        const userWithTeam = await db.user.findUnique({
          where: { id: token.id as string },
          include: {
            ownedTeams: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
            teamMemberships: {
              take: 1,
              include: { team: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        })

        if (userWithTeam) {
          const team = userWithTeam.ownedTeams[0] || userWithTeam.teamMemberships[0]?.team
          if (team) {
            token.teamId = team.id
            token.teamName = team.name
            token.credits = team.credits
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.teamId = token.teamId as string
        session.user.teamName = token.teamName as string
        session.user.credits = token.credits as number
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      await createDefaultTeam(user.id, user.name || 'Mein Team')
    },
  },
}

async function createDefaultTeam(userId: string, name: string) {
  const slug = `team-${userId.slice(0, 8)}`

  const team = await db.team.create({
    data: {
      name,
      slug,
      ownerId: userId,
      credits: 50, // Welcome credits
    },
  })

  await db.teamMember.create({
    data: {
      teamId: team.id,
      userId,
      role: 'OWNER',
    },
  })

  // Log welcome credits
  await db.creditLedger.create({
    data: {
      teamId: team.id,
      userId,
      amount: 50,
      balance: 50,
      type: 'BONUS',
      description: 'Willkommensbonus',
    },
  })

  return team
}

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedTeams: true,
      teamMemberships: {
        include: { team: true },
      },
    },
  })

  return user
}

export async function getCurrentTeam() {
  const session = await getSession()
  if (!session?.user?.teamId) return null

  return db.team.findUnique({
    where: { id: session.user.teamId },
    include: {
      owner: true,
      members: {
        include: { user: true },
      },
      brands: true,
    },
  })
}
