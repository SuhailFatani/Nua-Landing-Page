import { z } from 'zod'

export const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
