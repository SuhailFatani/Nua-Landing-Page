/**
 * Admin media library — upload, view, edit alt text, delete files.
 */
'use client'

import { useState, useRef } from 'react'
import { useMedia, useUploadMedia, useUpdateMedia, useDeleteMedia } from '@/services/media'
import { useAuthStore } from '@/stores/authStore'

export default function AdminMediaPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMedia({ page, limit: 20 })
  const { mutate: upload, isPending: isUploading } = useUploadMedia()
  const { mutate: updateMedia } = useUpdateMedia()
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia()
  const user = useAuthStore((s) => s.user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAlt, setEditAlt] = useState('')

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    upload({ file })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return
    deleteMedia(id)
  }

  const handleSaveAlt = (id: string) => {
    updateMedia({ id, alt: editAlt })
    setEditingId(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
            Media Library
          </h1>
          <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-8)' }}>
            {data?.total ?? 0} files
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              backgroundColor: isUploading ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
              color: 'var(--colors-natural-50)',
              padding: 'var(--space-10) var(--space-20)',
              borderRadius: 'var(--border-radius-2xsm)',
              fontSize: 'var(--font-size-14)',
              fontWeight: '600',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            {isUploading ? 'Uploading...' : '+ Upload File'}
          </button>
        </div>
      </div>

      {/* Media grid */}
      {isLoading ? (
        <p style={{ color: 'var(--colors-natural-400)' }}>Loading...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-16)',
            }}
          >
            {data?.files?.map((file: any) => (
              <div
                key={file.id}
                style={{
                  backgroundColor: 'var(--colors-vulcan-900)',
                  border: '1px solid var(--colors-vulcan-700)',
                  borderRadius: 'var(--border-radius-md)',
                  overflow: 'hidden',
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    backgroundColor: 'var(--colors-vulcan-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {file.mimeType?.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.alt || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)' }}>
                      {file.mimeType || 'File'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: 'var(--space-12)' }}>
                  <p
                    style={{
                      color: 'var(--colors-natural-200)',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 'var(--space-8)',
                    }}
                    title={file.url}
                  >
                    {file.alt || file.url?.split('/').pop() || 'Untitled'}
                  </p>

                  {file.width && file.height && (
                    <p style={{ color: 'var(--colors-natural-500)', fontSize: '11px', marginBottom: 'var(--space-8)' }}>
                      {file.width} × {file.height} &middot; {file.size ? `${(file.size / 1024).toFixed(0)} KB` : ''}
                    </p>
                  )}

                  {/* Alt text edit */}
                  {editingId === file.id ? (
                    <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-8)' }}>
                      <input
                        value={editAlt}
                        onChange={(e) => setEditAlt(e.target.value)}
                        placeholder="Alt text"
                        style={{
                          flex: 1,
                          padding: '4px var(--space-8)',
                          backgroundColor: 'var(--colors-vulcan-950)',
                          border: '1px solid var(--colors-vulcan-700)',
                          borderRadius: 'var(--border-radius-2xsm)',
                          color: 'var(--colors-natural-100)',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleSaveAlt(file.id)}
                        style={{
                          padding: '4px var(--space-8)',
                          backgroundColor: 'var(--colors-blue-600)',
                          border: 'none',
                          borderRadius: 'var(--border-radius-2xsm)',
                          color: 'var(--colors-natural-50)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.url)
                      }}
                      style={{
                        padding: '4px var(--space-8)',
                        backgroundColor: 'var(--colors-vulcan-700)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-2xsm)',
                        color: 'var(--colors-natural-300)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(file.id)
                        setEditAlt(file.alt || '')
                      }}
                      style={{
                        padding: '4px var(--space-8)',
                        backgroundColor: 'var(--colors-vulcan-700)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-2xsm)',
                        color: 'var(--colors-natural-300)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit Alt
                    </button>
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={isDeleting}
                        style={{
                          padding: '4px var(--space-8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 'var(--border-radius-2xsm)',
                          color: '#EF4444',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!data?.files?.length && (
            <div
              style={{
                backgroundColor: 'var(--colors-vulcan-900)',
                border: '1px solid var(--colors-vulcan-700)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--space-34)',
                textAlign: 'center',
                color: 'var(--colors-natural-500)',
              }}
            >
              No files uploaded yet. Click "Upload File" to get started.
            </div>
          )}

          {/* Pagination */}
          {data?.total > 20 && (
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
                disabled={page * 20 >= (data?.total ?? 0)}
                style={{
                  padding: 'var(--space-8) var(--space-16)',
                  backgroundColor: 'var(--colors-vulcan-800)',
                  border: '1px solid var(--colors-vulcan-700)',
                  borderRadius: 'var(--border-radius-2xsm)',
                  color: page * 20 >= (data?.total ?? 0) ? 'var(--colors-natural-600)' : 'var(--colors-natural-300)',
                  cursor: page * 20 >= (data?.total ?? 0) ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--font-size-14)',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
