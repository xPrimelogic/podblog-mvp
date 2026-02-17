import type { ReactNode } from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { 
  Home, 
  Settings, 
  FileText, 
  LogOut,
  Menu,
  Mic2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  
  const profile = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    .then(r => r.data) : null

  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() || 'T'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                  <Mic2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PodBlog
                </span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/settings/blog">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Blog Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || user?.email || 'Tester'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || 'test@podblog.it'}
                      </p>
                    </div>
                    <Avatar className="h-9 w-9 border-2 border-purple-200">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {profile?.full_name || 'Tester'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || 'test@podblog.it'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/blog" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 PodBlog. Trasforma i tuoi podcast in articoli SEO-optimized.
          </p>
        </div>
      </footer>
    </div>
  )
}
