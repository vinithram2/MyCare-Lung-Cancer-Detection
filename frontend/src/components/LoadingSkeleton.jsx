import React from 'react'

function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-slate-200 rounded-2xl animate-pulse ${className}`} />
  )
}

export function ResultsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left — image */}
      <div className="flex flex-col gap-4">
        <SkeletonBox className="w-full aspect-square" />
        <div className="flex gap-3">
          <SkeletonBox className="h-9 flex-1" />
          <SkeletonBox className="h-9 flex-1" />
        </div>
      </div>

      {/* Right — results */}
      <div className="flex flex-col gap-5">
        <SkeletonBox className="h-8 w-2/3" />
        <SkeletonBox className="h-5 w-1/3" />

        {/* Circular ring placeholder */}
        <div className="flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-slate-200 animate-pulse border-8 border-slate-300" />
        </div>

        <SkeletonBox className="h-6 w-1/2" />
        <SkeletonBox className="h-12" />
        <div className="flex gap-3">
          <SkeletonBox className="h-11 flex-1" />
          <SkeletonBox className="h-11 flex-1" />
        </div>
      </div>
    </div>
  )
}

export function GuidanceSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Summary card */}
      <SkeletonBox className="h-28 w-full" />

      {/* Next steps */}
      <div className="flex flex-col gap-3">
        <SkeletonBox className="h-6 w-1/3" />
        {[...Array(5)].map((_, i) => (
          <SkeletonBox key={i} className="h-16 w-full" />
        ))}
      </div>

      {/* Treatment cards */}
      <div className="flex flex-col gap-3">
        <SkeletonBox className="h-6 w-2/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-28" />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="flex flex-col gap-3">
        <SkeletonBox className="h-6 w-1/4" />
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-10" />
        ))}
      </div>
    </div>
  )
}
