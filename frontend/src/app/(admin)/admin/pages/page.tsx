/**
 * Admin pages editor — select a page by slug, edit its content JSON.
 */
'use client'

import { useState } from 'react'
import { useAllPages, useUpdatePage, type PageSlug } from '@/services/pages'

const PAGE_SLUGS: PageSlug[] = ['home', 'pricing', 'services', 'company', 'blog', 'book_a_demo']

export default function AdminPagesPage() {
  const [selectedSlug, setSelectedSlug] = useState<PageSlug>('home')
  const { data, isLoading } = useAllPages()
  const { mutate: updatePage, isPending } = useUpdatePage()
  const [contentJson, setContentJson] = useState('')
  const [jsonError, setJsonError] = useState('')

  const selectedPage = data?.pages?.find((p: any) => p.slug === selectedSlug)

  const handleSelectPage = (slug: PageSlug) => {
    setSelectedSlug(slug)
    const page = data?.pages?.find((p: any) => p.slug === slug)
    if (page?.content) {
      setContentJson(JSON.stringify(page.content, null, 2))
    } else {
      setContentJson('{}')
    }
    setJsonError('')
  }

  const handleSave = () => {
    try {
      const parsed = JSON.parse(contentJson)
      setJsonError('')
      updatePage({ slug: selectedSlug, content: parsed })
    } catch {
      setJsonError('Invalid JSON. Please fix the syntax and try again.')
    }
  }

  // Initialize content when data first loads
  if (data && !contentJson) {
    const page = data.pages?.find((p: any) => p.slug === selectedSlug)
    if (page?.content) {
      setContentJson(JSON.stringify(page.content, null, 2))
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-24)' }}>
        Page Content Editor
      </h1>

      {/* Page selector */}
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-24)', flexWrap: 'wrap' }}>
        {PAGE_SLUGS.map((slug) => (
          <button
            key={slug}
            onClick={() => handleSelectPage(slug)}
            style={{
              padding: 'var(--space-10) var(--space-20)',
              borderRadius: 'var(--border-radius-2xsm)',
              border: '1px solid',
              borderColor: selectedSlug === slug ? 'var(--colors-blue-600)' : 'var(--colors-vulcan-700)',
              backgroundColor: selectedSlug === slug ? 'var(--colors-blue-600)' : 'transparent',
              color: selectedSlug === slug ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-14)',
              fontWeight: '500',
              textTransform: 'capitalize',
            }}
          >
            {slug.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--colors-natural-400)' }}>Loading pages...</p>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-24)',
          }}
        >
          {/* Page info */}
          {selectedPage && (
            <div style={{ marginBottom: 'var(--space-20)' }}>
              <p style={{ color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)' }}>
                <strong>Title:</strong> {selectedPage.title} &nbsp;|&nbsp;
                <strong>Published:</strong> {selectedPage.isPublished ? 'Yes' : 'No'} &nbsp;|&nbsp;
                <strong>Updated:</strong> {selectedPage.updatedAt ? new Date(selectedPage.updatedAt).toLocaleString() : '—'}
              </p>
            </div>
          )}

          {/* JSON editor */}
          <label style={{ display: 'block', color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)', fontWeight: '500', marginBottom: 'var(--space-8)' }}>
            Content (JSON)
          </label>
          <textarea
            value={contentJson}
            onChange={(e) => { setContentJson(e.target.value); setJsonError('') }}
            rows={20}
            style={{
              width: '100%',
              padding: 'var(--space-16)',
              backgroundColor: 'var(--colors-vulcan-950)',
              border: `1px solid ${jsonError ? '#EF4444' : 'var(--colors-vulcan-700)'}`,
              borderRadius: 'var(--border-radius-xsm)',
              color: 'var(--colors-natural-100)',
              fontSize: '13px',
              fontFamily: 'monospace',
              lineHeight: '1.5',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          {jsonError && <p style={{ color: '#EF4444', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-8)' }}>{jsonError}</p>}

          <div style={{ marginTop: 'var(--space-16)', display: 'flex', gap: 'var(--space-12)' }}>
            <button
              onClick={handleSave}
              disabled={isPending}
              style={{
                backgroundColor: isPending ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
                color: 'var(--colors-natural-50)',
                padding: 'var(--space-10) var(--space-24)',
                borderRadius: 'var(--border-radius-2xsm)',
                fontSize: 'var(--font-size-14)',
                fontWeight: '600',
                border: 'none',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                try {
                  setContentJson(JSON.stringify(JSON.parse(contentJson), null, 2))
                  setJsonError('')
                } catch {
                  setJsonError('Cannot format — invalid JSON')
                }
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--colors-natural-400)',
                padding: 'var(--space-10) var(--space-16)',
                borderRadius: 'var(--border-radius-2xsm)',
                border: '1px solid var(--colors-vulcan-700)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-14)',
              }}
            >
              Format JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
