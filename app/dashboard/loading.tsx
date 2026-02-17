import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Upload Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
          <Skeleton className="h-8 w-48 bg-white/20" />
          <Skeleton className="h-4 w-64 mt-2 bg-white/10" />
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-3">
            <Skeleton className="flex-1 h-14 rounded-xl" />
            <Skeleton className="flex-1 h-14 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>

      {/* Articles Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/50">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
