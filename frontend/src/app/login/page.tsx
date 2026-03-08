/**
 * Login page — React Hook Form + Zod + useLogin mutation.
 * Handles locked accounts and invalid credentials gracefully.
 */
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/validators/auth'
import { useLogin } from '@/services/auth'
import { Icon } from '@iconify/react'

export default function LoginPage() {
  const { mutate: login, isPending, isError, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  const errorMessage = (error as any)?.response?.data?.message || 'Login failed. Please check your credentials.'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colors-vulcan-1000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-24)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-34)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
            <Icon icon="solar:shield-check-bold" style={{ fontSize: '32px', color: 'var(--colors-blue-600)' }} />
            <span style={{ fontSize: 'var(--font-size-24)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
              Nua Security
            </span>
          </div>
          <p style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)' }}>
            Admin Panel — Sign in to continue
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-34)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@nuasecurity.com"
                autoComplete="email"
                style={inputStyle(!!errors.email)}
              />
              {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                style={inputStyle(!!errors.password)}
              />
              {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
            </div>

            {/* API error */}
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
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                backgroundColor: isPending ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
                color: 'var(--colors-natural-50)',
                padding: 'var(--space-12) var(--space-24)',
                borderRadius: 'var(--border-radius-2xsm)',
                fontSize: 'var(--font-size-16)',
                fontWeight: 'var(--font-weight-semibold)',
                border: 'none',
                cursor: isPending ? 'not-allowed' : 'pointer',
                width: '100%',
                marginTop: 'var(--space-8)',
              }}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
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
