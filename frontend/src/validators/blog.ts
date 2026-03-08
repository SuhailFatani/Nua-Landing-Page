import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content is too short'),
  excerpt: z.string().max(300, 'Excerpt cannot exceed 300 characters').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  tags: z.array(z.string()).optional(),
  coverImageId: z.string().optional(),
  metaTitle: z.string().max(60, 'Meta title should be under 60 characters').optional(),
  metaDesc: z.string().max(160, 'Meta description should be under 160 characters').optional(),
})

export type CreatePostFormData = z.infer<typeof createPostSchema>
