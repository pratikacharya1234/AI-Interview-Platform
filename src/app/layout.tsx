import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ConditionalLayout } from '@/components/ConditionalLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Providers } from '@/components/providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import StorageCleanup from '@/components/StorageCleanup'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'AI Interview Platform - Practice with AI-Powered Mock Interviews',
    template: '%s | AI Interview Platform'
  },
  description: 'Master your job interviews with AI-powered mock interviews, real-time feedback, and personalized coaching. Practice technical, behavioral, and system design questions with Google Gemini AI.',
  keywords: [
    'AI interview practice',
    'mock interviews',
    'job interview preparation',
    'AI coaching',
    'technical interviews',
    'behavioral questions',
    'interview feedback',
    'career preparation',
    'Google Gemini AI',
    'interview platform'
  ],
  authors: [{ name: 'AI Interview Platform Team' }],
  creator: 'AI Interview Platform',
  publisher: 'AI Interview Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aiinterviewplatform.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aiinterviewplatform.com',
    title: 'AI Interview Platform - Master Your Job Interviews with AI',
    description: 'Practice interviews with AI-powered questions, get real-time feedback, and improve your interview skills with personalized coaching.',
    siteName: 'AI Interview Platform',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Interview Platform - Practice Mock Interviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Interview Platform - Master Your Job Interviews',
    description: 'Practice interviews with AI-powered questions and get real-time feedback to improve your interview skills.',
    images: ['/twitter-image.jpg'],
    creator: '@aiinterviewapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'education',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'AI Interview Platform',
              url: 'https://aiinterviewplatform.com',
              description: 'AI-powered interview practice platform with personalized feedback and coaching',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              creator: {
                '@type': 'Organization',
                name: 'AI Interview Platform Team'
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <StorageCleanup />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ErrorBoundary>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ErrorBoundary>
          </Providers>
        </ThemeProvider>
        
        {/* Performance monitoring script placeholder */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Web Vitals tracking
                if ('PerformanceObserver' in window) {
                  const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                      // Send metrics to analytics service
                      console.log('Performance metric:', entry.name, entry.value);
                    });
                  });
                  observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
                }
              `
            }}
          />
        )}
      </body>
    </html>
  )
}