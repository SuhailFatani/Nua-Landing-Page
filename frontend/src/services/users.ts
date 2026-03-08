/**
 * Users service hooks — team management and audit log.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface CreateUserBody {
  email: string
  name: string
  password: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

export interface UpdateUserBody {
  id: string
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER'
  isActive?: boolean
  name?: string
  avatarUrl?: string
}

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users/').then((r) => r.data),
  })

export const useCreateUser = () =>
  useMutation({
    mutationFn: (body: CreateUserBody) =>
      api.post('/api/users/create/', body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

export const useUpdateUser = () =>
  useMutation({
    mutationFn: ({ id, ...body }: UpdateUserBody) =>
      api.patch(`/api/users/${id}/`, body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

export const useDeleteUser = () =>
  useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/users/${id}/delete/`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

export const useAuditLog = (page = 1) =>
  useQuery({
    queryKey: ['audit', page],
    queryFn: () =>
      api.get('/api/users/audit-log/', { params: { page } }).then((r) => r.data),
  })
