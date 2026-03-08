/**
 * Media service hooks — upload and manage files.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface MediaListParams {
  page?: number
  limit?: number
}

export const useMedia = (params: MediaListParams = {}) =>
  useQuery({
    queryKey: ['media', params],
    queryFn: () => api.get('/api/media/', { params }).then((r) => r.data),
  })

export const useUploadMedia = () =>
  useMutation({
    mutationFn: ({ file, alt }: { file: File; alt?: string }) => {
      const form = new FormData()
      form.append('file', file)
      if (alt) form.append('alt', alt)
      return api
        .post('/api/media/upload/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })

export const useUpdateMedia = () =>
  useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) =>
      api.patch(`/api/media/${id}/`, { alt }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })

export const useDeleteMedia = () =>
  useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/media/${id}/delete/`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })
