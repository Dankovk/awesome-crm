import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)

        if (!user[0]) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user[0].password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user[0].id,
          email: user[0].email,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        try {
          // Check if user exists
          const existingUser = await db.select().from(users).where(eq(users.email, user.email!)).limit(1)
          
          if (!existingUser[0]) {
            // Create new user with GitHub data
            const now = new Date()
            const [newUser] = await db.insert(users).values({
              email: user.email!,
              password: '', // No password for OAuth users
              createdAt: now,
              updatedAt: now,
              githubId: (profile as any)?.id?.toString(),
              githubToken: account.access_token || '',
            }).returning()
            
            user.id = newUser.id
          } else {
            // Update existing user with GitHub token
            await db.update(users).set({
              githubId: (profile as any)?.id?.toString(),
              githubToken: account.access_token || '',
              updatedAt: new Date(),
            }).where(eq(users.id, existingUser[0].id))
            
            user.id = existingUser[0].id
          }
        } catch (error) {
          console.error('GitHub sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        if (token.accessToken) {
          session.accessToken = token.accessToken as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 