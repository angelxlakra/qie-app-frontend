
import { Skeleton } from "./Skeleton"

export function EventCardSkeleton() {
  return (
    <div className="card block space-y-4">
      <div>
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="space-y-2">
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      <div className="pt-2">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function TicketCardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function EventDetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-500">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            
            <div className="space-y-3 mb-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
