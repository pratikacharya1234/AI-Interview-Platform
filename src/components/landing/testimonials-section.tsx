'use client'

import { useState, useEffect } from 'react'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content: 'The AI feedback was incredibly detailed and helped me identify blind spots I never knew I had. After just 3 weeks of practice, I aced my technical interviews and landed my dream job.',
    rating: 5,
    image: '/testimonials/sarah.jpg',
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Product Manager at Microsoft',
    content: 'The role-specific questions were exactly what I faced in my actual interviews. The platform helped me structure my answers using the STAR method and improved my confidence tremendously.',
    rating: 5,
    image: '/testimonials/michael.jpg',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    name: 'Emily Johnson',
    role: 'Data Scientist at Amazon',
    content: 'The analytics dashboard showed my improvement over time, which kept me motivated. I went from nervous to confident in just a few sessions. This platform is a game-changer.',
    rating: 5,
    image: '/testimonials/emily.jpg',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    name: 'David Kim',
    role: 'UX Designer at Apple',
    content: 'The video analysis feature helped me improve my body language and presentation skills. I could see exactly what interviewers would see and make adjustments accordingly.',
    rating: 5,
    image: '/testimonials/david.jpg',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Lisa Thompson',
    role: 'Marketing Director at Netflix',
    content: 'As someone transitioning careers, the AI coach was invaluable. It helped me translate my skills and tell my story effectively. I landed multiple offers within a month.',
    rating: 5,
    image: '/testimonials/lisa.jpg',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    name: 'James Wilson',
    role: 'DevOps Engineer at Meta',
    content: 'The technical interview prep was outstanding. The AI asked follow-up questions just like a real interviewer would, pushing me to think deeper about my solutions.',
    rating: 5,
    image: '/testimonials/james.jpg',
    gradient: 'from-teal-500 to-green-500'
  }
]

export default function TestimonialsSection() {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const visibleTestimonials = testimonials.slice(currentIndex * 3, (currentIndex + 1) * 3)

  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className={cn(
            "text-4xl sm:text-5xl font-bold",
            "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300",
            "bg-clip-text text-transparent",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Success Stories
          </h2>
          <p className={cn(
            "mt-4 text-lg text-gray-600 dark:text-gray-400",
            "transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Join thousands who transformed their careers with AI Interview Pro
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={`${currentIndex}-${index}`}
              className={cn(
                "group relative",
                "transition-all duration-700",
                mounted ? `opacity-100 translate-y-0 delay-${index * 100}` : "opacity-0 translate-y-4"
              )}
            >
              <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-200 dark:text-gray-700" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 relative z-10">
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold",
                    testimonial.gradient
                  )}>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(Math.ceil(testimonials.length / 3))].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === i 
                  ? "w-8 bg-blue-600 dark:bg-blue-400" 
                  : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
              )}
            />
          ))}
        </div>

        {/* Stats */}
        <div className={cn(
          "mt-16 p-8 rounded-2xl",
          "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
          "border border-blue-200 dark:border-blue-800",
          "transition-all duration-700 delay-300",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Interview Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">3.2x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Confidence Increase</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">2 weeks</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg. Time to Job Offer</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
