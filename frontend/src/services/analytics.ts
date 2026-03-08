/**
 * Analytics service hooks.
 * - Public tracking functions: fire-and-forget, NEVER throw errors
 * - Admin dashboard and realtime hooks
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ── Public Tracking (fire-and-forget) ────────────────────────────────────────

export function trackPageView(page: string, sessionId?: string): void {
  api
    .post('/api/analytics/pageview/', { page, sessionId })
    .catch(() => {})   // Never break the user experience
}

export function trackEvent(
  type: string,
  page: string,
  label?: string,
  metadata?: Record<string, unknown>
): void {
  api
    .post('/api/analytics/event/', { type, page, label, metadata })
    .catch(() => {})
}

// ── Demo Booking ──────────────────────────────────────────────────────────────

export interface BookingFormData {
  name: string
  email: string
  company?: string
  phone?: string
  message?: string
  source?: string
}

export const useSubmitBooking = () =>
  useMutation({
    mutationFn: (body: BookingFormData) =>
      api.post('/api/analytics/booking/', body).then((r) => r.data),
  })

// ── Admin Hooks ───────────────────────────────────────────────────────────────

export const useDashboard = (days = 30) =>
  useQuery({
    queryKey: ['analytics', 'dashboard', days],
    queryFn: () =>
      api.get('/api/analytics/dashboard/', { params: { days } }).then((r) => r.data),
    refetchInterval: 60_000,   // Auto-refresh every minute
  })

export const useRealtime = () =>
  useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: () => api.get('/api/analytics/realtime/').then((r) => r.data),
    refetchInterval: 30_000,   // Poll every 30s
  })

export const useBookings = (page = 1, status?: string) =>
  useQuery({
    queryKey: ['bookings', page, status],
    queryFn: () =>
      api
        .get('/api/analytics/bookings/', { params: { page, status } })
        .then((r) => r.data),
  })
