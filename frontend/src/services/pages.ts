/**
 * Pages service hooks — CMS landing page content.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export type PageSlug = 'home' | 'pricing' | 'services' | 'company' | 'blog' | 'book_a_demo'

export interface UpdatePageBody {
  slug: PageSlug
  title?: string
  metaDesc?: string
  content?: Record<string, unknown>
  isPublished?: boolean
}

export const usePage = (slug: PageSlug) =>
  useQuery({
    queryKey: ['pages', slug],
    queryFn: () => api.get(`/api/pages/${slug}/`).then((r) => r.data),
    staleTime: 1000 * 60 * 15,   // Pages change rarely — 15 min staleness
    enabled: !!slug,
  })

export const useAllPages = () =>
  useQuery({
    queryKey: ['pages', 'admin', 'all'],
    queryFn: () => api.get('/api/pages/admin/all/').then((r) => r.data),
  })

export const useUpdatePage = () =>
  useMutation({
    mutationFn: ({ slug, ...body }: UpdatePageBody) =>
      api.put(`/api/pages/${slug}/update/`, body).then((r) => r.data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['pages', slug] })
      queryClient.invalidateQueries({ queryKey: ['pages', 'admin', 'all'] })
    },
  })
