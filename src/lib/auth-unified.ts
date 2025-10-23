import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      }
    })
  ],
  callbacks: {
    
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token
        token.githubId = account.providerAccountId
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
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
      // Send properties to the client
      if (session.user) {
        (session.user as any).id = token.userId as string
        (session.user as any).githubId = token.githubId as string
        (session.user as any).login = token.login as string
        (session.user as any).accessToken = token.accessToken as string
        
        // Additional GitHub data
        if (token.avatar_url) (session.user as any).avatar_url = token.avatar_url
        if (token.bio) (session.user as any).bio = token.bio
        if (token.company) (session.user as any).company = token.company
        if (token.location) (session.user as any).location = token.location
        if (token.public_repos) (session.user as any).public_repos = token.public_repos
        if (token.followers) (session.user as any).followers = token.followers
        if (token.following) (session.user as any).following = token.following
      }
      
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
}
