/**
 * Axios instance for all API calls.
 * - Attaches the JWT access token from Zustand store to every request
 * - On 401: auto-refreshes the token via httpOnly cookie, then retries
 * - On refresh failure: clears auth state and redirects to /login
 *
 * RULE: This is the ONLY place where axios is configured.
 * All components must use the service hooks in /services/, never raw api.get() etc.
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,          // send httpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token from memory store
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const { useAuthStore } = require('@/stores/authStore')
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// On 401: refresh token, retry original request once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh/`,
          {},
          { withCredentials: true }
        )

        if (typeof window !== 'undefined') {
          const { useAuthStore } = require('@/stores/authStore')
          useAuthStore.getState().setAccessToken(data.accessToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
        }

        return api(original)
      } catch {
        if (typeof window !== 'undefined') {
          const { useAuthStore } = require('@/stores/authStore')
          useAuthStore.getState().clearAuth()
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)
