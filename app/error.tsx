'use client'

import { useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Something went wrong!</h2>
        <p className="mb-6 text-gray-300 max-w-md">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
      </div>
      <Footer />
    </div>
  )
}
