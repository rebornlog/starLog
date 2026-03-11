'use client'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

interface SkeletonCardProps {
  count?: number
}

export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md animate-pulse"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <Skeleton className="w-12 h-4 sm:w-16 sm:h-4 flex-shrink-0 ml-2" />
        </div>
      ))}
    </>
  )
}

interface SkeletonFeatureCardProps {
  count?: number
}

export function SkeletonFeatureCard({ count = 4 }: SkeletonFeatureCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-green-200 dark:border-green-800 min-h-[280px] sm:min-h-[300px] flex flex-col animate-pulse"
        >
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg mb-3 sm:mb-4" />
          <Skeleton className="h-6 sm:h-7 md:h-8 w-3/4 mb-2 sm:mb-3" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-4 w-24 mt-3 sm:mt-4" />
        </div>
      ))}
    </>
  )
}

interface SkeletonTimelineProps {
  count?: number
}

export function SkeletonTimeline({ count = 5 }: SkeletonTimelineProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative pl-8 sm:pl-12 py-4 animate-pulse"
        >
          <Skeleton className="absolute left-0 top-6 w-4 h-4 rounded-full" />
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </>
  )
}
