'use client'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <Skeleton className="w-12 h-12 rounded-full mb-4" />
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-4" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  )
}

export function SkeletonArticle() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="w-3/4 h-5 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTimeline() {
  return (
    <div className="ml-10 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-2/3 h-6 mb-2" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  )
}
