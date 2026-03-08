/**
 * Admin audit log — paginated table of system actions.
 * ADMIN-only page.
 */
'use client'

import { useState } from 'react'
import { useAuditLog } from '@/services/users'

export default function AdminAuditPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAuditLog(page)

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-24)' }}>
        <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
          Audit Log
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-8)' }}>
          System activity and content changes
        </p>
      </div>

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
                {['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Details'].map((col) => (
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
              {data?.logs?.map((log: any) => (
                <tr key={log.uid || log.id} style={{ borderBottom: '1px solid var(--colors-vulcan-800)' }}>
                  <td style={{ padding: 'var(--space-12) var(--space-16)', color: 'var(--colors-natural-400)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: 'var(--space-12) var(--space-16)', color: 'var(--colors-natural-200)', fontSize: 'var(--font-size-14)' }}>
                    {log.userName || log.userEmail || '—'}
                  </td>
                  <td style={{ padding: 'var(--space-12) var(--space-16)' }}>
                    <ActionBadge action={log.action} />
                  </td>
                  <td style={{ padding: 'var(--space-12) var(--space-16)' }}>
                    <p style={{ color: 'var(--colors-natural-200)', fontSize: 'var(--font-size-14)' }}>
                      {log.resource}
                    </p>
                    {log.resourceId && (
                      <p style={{ color: 'var(--colors-natural-500)', fontSize: '11px', marginTop: '2px' }}>
                        {log.resourceId}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-12) var(--space-16)', color: 'var(--colors-natural-500)', fontSize: '12px', fontFamily: 'monospace' }}>
                    {log.ipAddress || '—'}
                  </td>
                  <td style={{ padding: 'var(--space-12) var(--space-16)', maxWidth: '200px' }}>
                    {(log.oldValue || log.newValue) ? (
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ color: 'var(--colors-blue-400)', fontSize: '12px' }}>
                          View changes
                        </summary>
                        <div style={{ marginTop: 'var(--space-8)', fontSize: '11px', fontFamily: 'monospace' }}>
                          {log.oldValue && (
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ color: '#EF4444' }}>- </span>
                              <span style={{ color: 'var(--colors-natural-400)' }}>
                                {typeof log.oldValue === 'string' ? log.oldValue : JSON.stringify(log.oldValue, null, 2)}
                              </span>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <span style={{ color: '#22C55E' }}>+ </span>
                              <span style={{ color: 'var(--colors-natural-400)' }}>
                                {typeof log.newValue === 'string' ? log.newValue : JSON.stringify(log.newValue, null, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </details>
                    ) : (
                      <span style={{ color: 'var(--colors-natural-600)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!data?.logs?.length && (
                <tr>
                  <td colSpan={6} style={{ padding: 'var(--space-34)', textAlign: 'center', color: 'var(--colors-natural-500)' }}>
                    No audit log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.total > 50 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-24)' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: 'var(--space-8) var(--space-16)',
              backgroundColor: 'var(--colors-vulcan-800)',
              border: '1px solid var(--colors-vulcan-700)',
              borderRadius: 'var(--border-radius-2xsm)',
              color: page === 1 ? 'var(--colors-natural-600)' : 'var(--colors-natural-300)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-14)',
            }}
          >
            Previous
          </button>
          <span style={{ padding: 'var(--space-8) var(--space-12)', color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 50 >= (data?.total ?? 0)}
            style={{
              padding: 'var(--space-8) var(--space-16)',
              backgroundColor: 'var(--colors-vulcan-800)',
              border: '1px solid var(--colors-vulcan-700)',
              borderRadius: 'var(--border-radius-2xsm)',
              color: page * 50 >= (data?.total ?? 0) ? 'var(--colors-natural-600)' : 'var(--colors-natural-300)',
              cursor: page * 50 >= (data?.total ?? 0) ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-14)',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function ActionBadge({ action }: { action: string }) {
  const normalized = (action || '').toUpperCase()
  let bg = 'rgba(107, 114, 128, 0.15)'
  let text = 'var(--colors-natural-400)'
  let border = 'var(--colors-vulcan-600)'

  if (normalized.includes('CREATE') || normalized.includes('INSERT')) {
    bg = 'rgba(34, 197, 94, 0.15)'
    text = '#22C55E'
    border = 'rgba(34, 197, 94, 0.3)'
  } else if (normalized.includes('DELETE') || normalized.includes('REMOVE')) {
    bg = 'rgba(239, 68, 68, 0.1)'
    text = '#EF4444'
    border = 'rgba(239, 68, 68, 0.3)'
  } else if (normalized.includes('UPDATE') || normalized.includes('EDIT')) {
    bg = 'rgba(59, 130, 246, 0.15)'
    text = '#3B82F6'
    border = 'rgba(59, 130, 246, 0.3)'
  } else if (normalized.includes('LOGIN') || normalized.includes('AUTH')) {
    bg = 'rgba(168, 85, 247, 0.15)'
    text = '#A855F7'
    border = 'rgba(168, 85, 247, 0.3)'
  }

  return (
    <span
      style={{
        padding: '2px var(--space-8)',
        borderRadius: 'var(--border-radius-full)',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {action}
    </span>
  )
}
