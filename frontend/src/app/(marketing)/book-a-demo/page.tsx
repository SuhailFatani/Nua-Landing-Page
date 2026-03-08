/**
 * Book a Demo page — React Hook Form + Zod + useSubmitBooking mutation.
 */
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema, BookingFormData } from '@/validators/booking'
import { useSubmitBooking, trackEvent } from '@/services/analytics'
import { PageViewTracker } from '@/components/PageViewTracker'
import { Icon } from '@iconify/react'

export default function BookADemoPage() {
  const { mutate: submitBooking, isPending, isSuccess, isError, error } = useSubmitBooking()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const onSubmit = (data: BookingFormData) => {
    submitBooking(
      { ...data, source: '/book-a-demo' },
      {
        onSuccess: () => {
          trackEvent('demo_booking_submitted', '/book-a-demo', data.email, { company: data.company })
          reset()
        },
      }
    )
  }

  if (isSuccess) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--colors-vulcan-1000)' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: 'var(--space-40)' }}>
          <Icon icon="solar:check-circle-bold" style={{ fontSize: '64px', color: 'var(--colors-blue-400)', marginBottom: 'var(--space-24)' }} />
          <h2 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-16)' }}>
            Demo Request Received!
          </h2>
          <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-16)' }}>
            Our team will reach out within 24 hours to schedule your personalized demo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--colors-vulcan-1000)', minHeight: '100vh', padding: 'var(--space-52) var(--space-24)' }}>
      <PageViewTracker page="/book-a-demo" />

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-48)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--colors-natural-50)',
            marginBottom: 'var(--space-16)',
          }}
        >
          Book a Demo
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)', marginBottom: 'var(--space-34)' }}>
          See how Nua Security can protect your organization. Schedule a personalized demo with our experts.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-34)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-20)',
          }}
        >
          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              {...register('name')}
              placeholder="John Smith"
              style={inputStyle(!!errors.name)}
            />
            {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Work Email *</label>
            <input
              {...register('email')}
              type="email"
              placeholder="john@company.com"
              style={inputStyle(!!errors.email)}
            />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

          {/* Company */}
          <div>
            <label style={labelStyle}>Company</label>
            <input
              {...register('company')}
              placeholder="Acme Corp"
              style={inputStyle(false)}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+1 (555) 000-0000"
              style={inputStyle(false)}
            />
          </div>

          {/* Message */}
          <div>
            <label style={labelStyle}>What are you looking to solve?</label>
            <textarea
              {...register('message')}
              placeholder="Tell us about your security challenges..."
              rows={4}
              style={{ ...inputStyle(!!errors.message), resize: 'vertical' }}
            />
            {errors.message && <p style={errorStyle}>{errors.message.message}</p>}
          </div>

          {/* Error state */}
          {isError && (
            <div
              style={{
                padding: 'var(--space-12)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--border-radius-xsm)',
                color: '#EF4444',
                fontSize: 'var(--font-size-14)',
              }}
            >
              Something went wrong. Please try again or email us at info@nuasecurity.com
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              backgroundColor: isPending ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
              color: 'var(--colors-natural-50)',
              padding: 'var(--space-14) var(--space-24)',
              borderRadius: 'var(--border-radius-2xsm)',
              fontSize: 'var(--font-size-16)',
              fontWeight: 'var(--font-weight-semibold)',
              border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {isPending ? 'Submitting...' : 'Request Demo'}
          </button>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--colors-natural-300)',
  fontSize: 'var(--font-size-14)',
  fontWeight: 'var(--font-weight-medium)',
  marginBottom: 'var(--space-8)',
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: 'var(--space-12) var(--space-16)',
  backgroundColor: 'var(--colors-vulcan-950)',
  border: `1px solid ${hasError ? '#EF4444' : 'var(--colors-vulcan-700)'}`,
  borderRadius: 'var(--border-radius-xsm)',
  color: 'var(--colors-natural-50)',
  fontSize: 'var(--font-size-16)',
  outline: 'none',
  fontFamily: 'inherit',
})

const errorStyle: React.CSSProperties = {
  color: '#EF4444',
  fontSize: 'var(--font-size-14)',
  marginTop: 'var(--space-8)',
}
