/**
 * Admin team management — list users, create, update role/status, delete.
 * ADMIN-only page.
 */
'use client'

import { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/services/users'

export default function AdminTeamPage() {
  const { data, isLoading } = useUsers()
  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: updateUser } = useUpdateUser()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EDITOR' as const })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createUser(
      { name: form.name, email: form.email, password: form.password, role: form.role },
      {
        onSuccess: () => {
          setShowForm(false)
          setForm({ name: '', email: '', password: '', role: 'EDITOR' })
        },
      },
    )
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    deleteUser(id)
  }

  const handleToggleActive = (user: any) => {
    updateUser({ id: user.uid || user.id, isActive: !user.isActive })
  }

  const handleRoleChange = (user: any, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    updateUser({ id: user.uid || user.id, role })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
            Team Members
          </h1>
          <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-8)' }}>
            {data?.users?.length ?? 0} members
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: showForm ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
            color: 'var(--colors-natural-50)',
            padding: 'var(--space-10) var(--space-20)',
            borderRadius: 'var(--border-radius-2xsm)',
            fontSize: 'var(--font-size-14)',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-24)',
            marginBottom: 'var(--space-24)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-16)',
          }}
        >
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map((field) => (
            <div key={field.key}>
              <label style={{ display: 'block', color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)', fontWeight: '500', marginBottom: 'var(--space-8)' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                required
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'var(--space-10) var(--space-12)',
                  backgroundColor: 'var(--colors-vulcan-950)',
                  border: '1px solid var(--colors-vulcan-700)',
                  borderRadius: 'var(--border-radius-2xsm)',
                  color: 'var(--colors-natural-100)',
                  fontSize: 'var(--font-size-14)',
                  outline: 'none',
                }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)', fontWeight: '500', marginBottom: 'var(--space-8)' }}>
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              style={{
                width: '100%',
                padding: 'var(--space-10) var(--space-12)',
                backgroundColor: 'var(--colors-vulcan-950)',
                border: '1px solid var(--colors-vulcan-700)',
                borderRadius: 'var(--border-radius-2xsm)',
                color: 'var(--colors-natural-100)',
                fontSize: 'var(--font-size-14)',
                outline: 'none',
              }}
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                backgroundColor: isCreating ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
                color: 'var(--colors-natural-50)',
                padding: 'var(--space-10) var(--space-24)',
                borderRadius: 'var(--border-radius-2xsm)',
                fontSize: 'var(--font-size-14)',
                fontWeight: '600',
                border: 'none',
                cursor: isCreating ? 'not-allowed' : 'pointer',
              }}
            >
              {isCreating ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div
        style={{
          backgroundColor: 'var(--colors-vulcan-900)',
          border: '1px solid var(--colors-vulcan-700)',
          borderRadius: 'var(--border-radius-md)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: 'var(--space-34)', textAlign: 'center', color: 'var(--colors-natural-400)' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--colors-vulcan-700)' }}>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: 'var(--space-12) var(--space-16)',
                      textAlign: 'left',
                      color: 'var(--colors-natural-500)',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u: any) => (
                <tr key={u.uid || u.id} style={{ borderBottom: '1px solid var(--colors-vulcan-800)' }}>
                  <td style={{ padding: 'var(--space-16)' }}>
                    <p style={{ color: 'var(--colors-natural-100)', fontSize: 'var(--font-size-14)', fontWeight: '500' }}>
                      {u.name}
                    </p>
                  </td>
                  <td style={{ padding: 'var(--space-16)', color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: 'var(--space-16)' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value as any)}
                      style={{
                        padding: '4px var(--space-8)',
                        backgroundColor: 'var(--colors-vulcan-800)',
                        border: '1px solid var(--colors-vulcan-700)',
                        borderRadius: 'var(--border-radius-2xsm)',
                        color: 'var(--colors-natural-200)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: 'var(--space-16)' }}>
                    <button
                      onClick={() => handleToggleActive(u)}
                      style={{
                        padding: '2px var(--space-8)',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: '1px solid',
                        cursor: 'pointer',
                        backgroundColor: u.isActive !== false ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                        color: u.isActive !== false ? '#22C55E' : '#EF4444',
                        borderColor: u.isActive !== false ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: 'var(--space-16)' }}>
                    <button
                      onClick={() => handleDelete(u.uid || u.id, u.name)}
                      disabled={isDeleting}
                      style={{
                        padding: '4px var(--space-10)',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--border-radius-2xsm)',
                        color: '#EF4444',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.users?.length && (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-34)', textAlign: 'center', color: 'var(--colors-natural-500)' }}>
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
