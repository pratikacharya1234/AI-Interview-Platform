import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.githubId = account.providerAccountId
      }
      if (profile) {
        token.login = (profile as any).login
        token.avatar_url = (profile as any).avatar_url
        token.bio = (profile as any).bio
        token.company = (profile as any).company
        token.location = (profile as any).location
        token.public_repos = (profile as any).public_repos
        token.followers = (profile as any).followers
        token.following = (profile as any).following
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken
      }
      if (token.githubId) {
        (session.user as any).githubId = token.githubId
      }
      if (token.login) {
        (session.user as any).login = token.login
      }
      if (token.avatar_url) {
        (session.user as any).avatar_url = token.avatar_url
      }
      if (token.bio) {
        (session.user as any).bio = token.bio
      }
      if (token.company) {
        (session.user as any).company = token.company
      }
      if (token.location) {
        (session.user as any).location = token.location
      }
      if (token.public_repos) {
        (session.user as any).public_repos = token.public_repos
      }
      if (token.followers) {
        (session.user as any).followers = token.followers
      }
      if (token.following) {
        (session.user as any).following = token.following
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}
