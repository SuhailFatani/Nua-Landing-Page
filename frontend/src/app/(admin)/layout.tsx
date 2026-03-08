/**
 * Admin layout — wraps all /admin/* pages.
 * Client component: checks auth state and redirects to /login if unauthenticated.
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { useAuthStore } from '@/stores/authStore'
import { useMe } from '@/services/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: user, isLoading, isError } = useMe()

  useEffect(() => {
    // If not authenticated after checking, redirect to login
    if (!isAuthenticated && !isLoading) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--colors-vulcan-1000)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--colors-natural-400)',
        }}
      >
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || isError) {
    return null   // Will redirect via useEffect
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--colors-vulcan-1000)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 'var(--space-34)', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
