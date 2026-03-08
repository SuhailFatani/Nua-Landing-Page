/**
 * Blog service hooks — public and admin post management.
 * ALL blog API calls go through these hooks. No raw axios in components.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface BlogListParams {
  page?: number
  limit?: number
  tag?: string
}

export interface AdminPostParams {
  page?: number
  limit?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export interface CreatePostBody {
  title: string
  content: string
  excerpt?: string
  slug?: string
  status?: 'DRAFT' | 'PUBLISHED'
  tags?: string[]
  coverImageId?: string
  metaTitle?: string
  metaDesc?: string
}

export interface UpdatePostBody extends Partial<CreatePostBody> {
  id: string
}

// ── Public Hooks ─────────────────────────────────────────────────────────────

export const usePublicPosts = (params: BlogListParams = {}) =>
  useQuery({
    queryKey: ['blog', 'public', params],
    queryFn: () => api.get('/api/blog/', { params }).then((r) => r.data),
  })

export const usePublicPost = (slug: string) =>
  useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => api.get(`/api/blog/${slug}/`).then((r) => r.data),
    enabled: !!slug,
  })

// ── Admin Hooks ───────────────────────────────────────────────────────────────

export const useAdminPosts = (params: AdminPostParams = {}) =>
  useQuery({
    queryKey: ['blog', 'admin', params],
    queryFn: () => api.get('/api/blog/admin/all/', { params }).then((r) => r.data),
  })

export const useCreatePost = () =>
  useMutation({
    mutationFn: (body: CreatePostBody) =>
      api.post('/api/blog/create/', body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog'] }),
  })

export const useUpdatePost = () =>
  useMutation({
    mutationFn: ({ id, ...body }: UpdatePostBody) =>
      api.patch(`/api/blog/${id}/update/`, body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog'] }),
  })

export const useDeletePost = () =>
  useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/blog/${id}/delete/`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog'] }),
  })
