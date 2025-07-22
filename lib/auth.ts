import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // @ts-expect-error - NextAuth credential types are complex
      async authorize(credentials) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(credentials as any)?.email || !(credentials as any)?.password) {
          return null
        }

        let user = null

        // Check if it's a child login (email contains @)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((credentials as any).email?.includes('@')) {
          // Parent login - standard email/password
          user = await prisma.user.findUnique({
            where: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              email: (credentials as any).email
            }
          })
        } else {
          // Child login - username format
          // Find child by username and get parent email
          const child = await prisma.user.findUnique({
            where: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              childUsername: (credentials as any).email
            },
            include: {
              parent: true
            }
          })
          
          if (child && child.parent) {
            user = child
          }
        }

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (credentials as any).password!,
          user.password!
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    })
  ],
  callbacks: {
    // @ts-expect-error - NextAuth callback types are complex
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.avatar = user.avatar
      }
      return token
    },
    // @ts-expect-error - NextAuth callback types are complex
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatar = token.avatar as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
