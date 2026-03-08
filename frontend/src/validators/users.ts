import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('EDITOR'),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
