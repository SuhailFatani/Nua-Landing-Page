/**
 * Zustand store for auth state (CLIENT state only).
 * Access token is stored in MEMORY (not localStorage) for XSS protection.
 * Refresh token lives in an httpOnly cookie — managed by the browser/server.
 */
import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  avatarUrl?: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean

  setAccessToken: (token: string) => void
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: true }),

  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
}))
