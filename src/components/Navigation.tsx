'use client'

import Link from 'next/link'
import { Brain } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold">AI Interview Pro</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
            <Link href="/interview" className="bg-blue-600 text-white px-4 py-2 rounded">Start Interview</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
