/**
 * Auth service hooks — login, logout, me, change-password.
 * ALL auth API calls go through these hooks. No raw axios in components.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'

export interface LoginCredentials {
  email: string
  password: string
}

export interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

export const useLogin = () => {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (creds: LoginCredentials) =>
      api.post('/api/auth/login/', creds).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user)
      router.push('/admin')
    },
  })
}

export const useLogout = () => {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => api.post('/api/auth/logout/').then((r) => r.data),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      router.push('/login')
    },
    onError: () => {
      // Force logout even if request fails
      clearAuth()
      queryClient.clear()
      router.push('/login')
    },
  })
}

export const useMe = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/api/auth/me/').then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (body: ChangePasswordBody) =>
      api.post('/api/auth/change-password/', body).then((r) => r.data),
  })
