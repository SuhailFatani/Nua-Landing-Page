/**
 * Create new blog post — Tiptap editor + RHF + Zod.
 */
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPostSchema, CreatePostFormData } from '@/validators/blog'
import { useCreatePost } from '@/services/blog'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { useState } from 'react'

export default function NewPostPage() {
  const router = useRouter()
  const { mutate: createPost, isPending } = useCreatePost()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
    ],
    content: '<p>Start writing your post...</p>',
    editorProps: {
      attributes: {
        style: 'min-height: 300px; padding: 16px; color: var(--colors-natural-100); outline: none; font-size: 16px; line-height: 1.8;',
      },
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { status: 'DRAFT' },
  })

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const onSubmit = (data: CreatePostFormData) => {
    const content = editor?.getHTML() || ''
    createPost(
      { ...data, content, tags },
      { onSuccess: () => router.push('/admin/blog') }
    )
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: 'var(--space-24)' }}>
        <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
          New Blog Post
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input {...register('title')} placeholder="Post title" style={inputStyle(!!errors.title)} />
          {errors.title && <p style={errStyle}>{errors.title.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug (auto-generated if empty)</label>
          <input {...register('slug')} placeholder="post-title-slug" style={inputStyle(!!errors.slug)} />
          {errors.slug && <p style={errStyle}>{errors.slug.message}</p>}
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Excerpt</label>
          <textarea {...register('excerpt')} placeholder="Brief summary..." rows={2} style={{ ...inputStyle(!!errors.excerpt), resize: 'vertical' }} />
        </div>

        {/* Content (Tiptap) */}
        <div>
          <label style={labelStyle}>Content *</label>
          {/* Toolbar */}
          {editor && (
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: 'var(--space-8)',
                backgroundColor: 'var(--colors-vulcan-800)',
                borderRadius: 'var(--border-radius-xsm) var(--border-radius-xsm) 0 0',
                border: '1px solid var(--colors-vulcan-700)',
                borderBottom: 'none',
                flexWrap: 'wrap',
              }}
            >
              {[
                { label: 'B', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
                { label: 'I', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                { label: 'H2', cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
                { label: 'H3', cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
                { label: '•', cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                { label: '1.', cmd: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
                { label: '"', cmd: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
                { label: '<>', cmd: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.cmd}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: btn.active ? 'var(--colors-blue-600)' : 'transparent',
                    color: btn.active ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)',
                    border: '1px solid var(--colors-vulcan-600)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    minWidth: '28px',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
          <div
            style={{
              backgroundColor: 'var(--colors-vulcan-950)',
              border: '1px solid var(--colors-vulcan-700)',
              borderRadius: editor ? '0 0 var(--border-radius-xsm) var(--border-radius-xsm)' : 'var(--border-radius-xsm)',
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', marginBottom: tags.length ? 'var(--space-8)' : 0 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px var(--space-10)',
                  backgroundColor: 'var(--colors-blue-950)',
                  border: '1px solid var(--colors-blue-800)',
                  borderRadius: 'var(--border-radius-full)',
                  color: 'var(--colors-blue-400)',
                  fontSize: '12px',
                }}
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--colors-blue-400)', cursor: 'pointer', padding: 0, fontSize: '14px' }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Add tag and press Enter"
              style={{ ...inputStyle(false), flex: 1 }}
            />
            <button type="button" onClick={addTag} style={{ padding: 'var(--space-10) var(--space-16)', backgroundColor: 'var(--colors-vulcan-700)', border: 'none', borderRadius: 'var(--border-radius-xsm)', color: 'var(--colors-natural-300)', cursor: 'pointer', fontSize: 'var(--font-size-14)' }}>
              Add
            </button>
          </div>
        </div>

        {/* SEO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
          <div>
            <label style={labelStyle}>Meta Title</label>
            <input {...register('metaTitle')} placeholder="SEO title (60 chars max)" style={inputStyle(false)} />
          </div>
          <div>
            <label style={labelStyle}>Meta Description</label>
            <input {...register('metaDesc')} placeholder="SEO description (160 chars max)" style={inputStyle(false)} />
          </div>
        </div>

        {/* Status + Submit */}
        <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--colors-vulcan-700)' }}>
          <select
            {...register('status')}
            style={{
              padding: 'var(--space-10) var(--space-16)',
              backgroundColor: 'var(--colors-vulcan-950)',
              border: '1px solid var(--colors-vulcan-700)',
              borderRadius: 'var(--border-radius-xsm)',
              color: 'var(--colors-natural-50)',
              fontSize: 'var(--font-size-14)',
              cursor: 'pointer',
            }}
          >
            <option value="DRAFT">Save as Draft</option>
            <option value="PUBLISHED">Publish</option>
          </select>

          <button
            type="submit"
            disabled={isPending}
            style={{
              backgroundColor: isPending ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)',
              color: 'var(--colors-natural-50)',
              padding: 'var(--space-10) var(--space-24)',
              borderRadius: 'var(--border-radius-2xsm)',
              fontSize: 'var(--font-size-14)',
              fontWeight: 'var(--font-weight-semibold)',
              border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Saving...' : 'Save Post'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
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
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)', fontWeight: '500', marginBottom: 'var(--space-8)' }
const inputStyle = (err: boolean): React.CSSProperties => ({ width: '100%', padding: 'var(--space-12) var(--space-16)', backgroundColor: 'var(--colors-vulcan-950)', border: `1px solid ${err ? '#EF4444' : 'var(--colors-vulcan-700)'}`, borderRadius: 'var(--border-radius-xsm)', color: 'var(--colors-natural-50)', fontSize: 'var(--font-size-16)', outline: 'none', fontFamily: 'inherit' })
const errStyle: React.CSSProperties = { color: '#EF4444', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-8)' }
