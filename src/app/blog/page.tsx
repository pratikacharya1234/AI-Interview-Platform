'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Calendar, Clock, ArrowRight, Tag, Search, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const categories = [
  'Interview Tips',
  'Career Development',
  'Technical Skills',
  'Industry Insights',
  'Success Stories',
  'Product Updates'
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In production, this would fetch from your CMS or API
    setLoading(false)
  }, [])

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Insights & Resources
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Expert advice, industry insights, and success strategies to accelerate your career growth
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'All' ? undefined : 'outline'}
                onClick={() => setSelectedCategory('All')}
              >
                All Posts
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? undefined : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Article */}
          <div className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Featured Article</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Mastering Behavioral Interviews: The Complete Guide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Learn proven strategies to excel in behavioral interviews, including the STAR method, 
              common questions, and how to craft compelling stories that showcase your skills.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  October 15, 2024
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  12 min read
                </span>
              </div>
              <Link href="/blog/mastering-behavioral-interviews">
                <Button className="group">
                  Read More
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading articles...</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article key={article.id} className="group">
                  <Link href={`/blog/${article.slug}`}>
                    <div className="h-full p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{article.date}</span>
                        <span>{article.readTime} min read</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  No articles available yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  We&apos;re working on creating valuable content for you. Check back soon or subscribe to our newsletter to get notified when new articles are published.
                </p>
                <Link href="/contact">
                  <Button>Get Notified</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Get the latest interview tips, career insights, and platform updates delivered to your inbox
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button variant="secondary">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
