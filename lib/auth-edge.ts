import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Edge-compatible auth config without Prisma adapter
export const authConfig = {
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
      async authorize() {
        // In edge runtime, we can't verify credentials
        // The actual verification happens in the API route
        return null
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

export const { auth: authEdge } = NextAuth(authConfig)