import type { ReactNode } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  // Auth temporarily disabled for testing
  // TODO: Re-enable after auth issues resolved
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">PodBlog MVP</h1>
              <span className="ml-4 text-sm text-red-600 font-medium">
                (Auth disabled - testing mode)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Home
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
