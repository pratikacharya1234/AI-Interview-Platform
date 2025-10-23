import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SupabaseProvider } from '@/lib/supabase/supabase-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Interview Platform',
  description: 'Practice interviews with AI-powered feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
