import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">PodBlog AI</h1>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition">
              Logout
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
