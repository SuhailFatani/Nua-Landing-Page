'use client'

import { useEffect } from 'react'
import { trackPageView } from '@/services/analytics'

interface PageViewTrackerProps {
  page: string
}

export function PageViewTracker({ page }: PageViewTrackerProps) {
  useEffect(() => {
    // Generate a session ID (stored in sessionStorage, not cookies)
    let sessionId = sessionStorage.getItem('nua_session')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('nua_session', sessionId)
    }
    trackPageView(page, sessionId)
  }, [page])

  return null
}
