/**
 * Edit blog post page — loads existing post, allows editing with Tiptap.
 */
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPostSchema, CreatePostFormData } from '@/validators/blog'
import { useUpdatePost } from '@/services/blog'
import { useRouter, useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function EditPostPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { mutate: updatePost, isPending } = useUpdatePost()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', 'edit', id],
    queryFn: () => api.get(`/api/blog/admin/all/`).then(r => {
      const found = r.data.posts.find((p: any) => p.id === id)
      return found || null
    }),
    enabled: !!id,
  })

  const editor = useEditor({
    extensions: [StarterKit, TiptapLink.configure({ openOnClick: false }), TiptapImage],
    content: '',
    editorProps: {
      attributes: {
        style: 'min-height: 300px; padding: 16px; color: var(--colors-natural-100); outline: none; font-size: 16px; line-height: 1.8;',
      },
    },
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  })

  // Populate form when post loads
  useEffect(() => {
    if (post && editor) {
      reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        status: post.status,
        metaTitle: post.metaTitle || '',
        metaDesc: post.metaDesc || '',
      })
      editor.commands.setContent(post.content || '')
      setTags(post.tags?.map((t: any) => t.name) || [])
    }
  }, [post, editor, reset])

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed])
    setTagInput('')
  }

  const onSubmit = (data: CreatePostFormData) => {
    const content = editor?.getHTML() || ''
    updatePost(
      { id, ...data, content, tags },
      { onSuccess: () => router.push('/admin/blog') }
    )
  }

  if (isLoading) {
    return <div style={{ color: 'var(--colors-natural-400)', padding: 'var(--space-34)' }}>Loading post...</div>
  }

  if (!post) {
    return <div style={{ color: 'var(--colors-natural-400)', padding: 'var(--space-34)' }}>Post not found.</div>
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-24)' }}>
        Edit Post
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input {...register('title')} style={inputStyle(!!errors.title)} />
          {errors.title && <p style={errStyle}>{errors.title.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Slug</label>
          <input {...register('slug')} style={inputStyle(!!errors.slug)} />
        </div>

        <div>
          <label style={labelStyle}>Excerpt</label>
          <textarea {...register('excerpt')} rows={2} style={{ ...inputStyle(false), resize: 'vertical' }} />
        </div>

        <div>
          <label style={labelStyle}>Content *</label>
          {editor && (
            <div style={{ display: 'flex', gap: '4px', padding: 'var(--space-8)', backgroundColor: 'var(--colors-vulcan-800)', borderRadius: 'var(--border-radius-xsm) var(--border-radius-xsm) 0 0', border: '1px solid var(--colors-vulcan-700)', borderBottom: 'none', flexWrap: 'wrap' }}>
              {[
                { label: 'B', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
                { label: 'I', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                { label: 'H2', cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
                { label: 'H3', cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
                { label: '•', cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                { label: '1.', cmd: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
              ].map((btn) => (
                <button key={btn.label} type="button" onClick={btn.cmd} style={{ padding: '4px 8px', backgroundColor: btn.active ? 'var(--colors-blue-600)' : 'transparent', color: btn.active ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)', border: '1px solid var(--colors-vulcan-600)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '28px' }}>
                  {btn.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ backgroundColor: 'var(--colors-vulcan-950)', border: '1px solid var(--colors-vulcan-700)', borderRadius: '0 0 var(--border-radius-xsm) var(--border-radius-xsm)' }}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', marginBottom: tags.length ? 'var(--space-8)' : 0 }}>
            {tags.map((tag) => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px var(--space-10)', backgroundColor: 'var(--colors-blue-950)', border: '1px solid var(--colors-blue-800)', borderRadius: 'var(--border-radius-full)', color: 'var(--colors-blue-400)', fontSize: '12px' }}>
                {tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} style={{ background: 'none', border: 'none', color: 'var(--colors-blue-400)', cursor: 'pointer', padding: 0, fontSize: '14px' }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="Add tag" style={{ ...inputStyle(false), flex: 1 }} />
            <button type="button" onClick={addTag} style={{ padding: 'var(--space-10) var(--space-16)', backgroundColor: 'var(--colors-vulcan-700)', border: 'none', borderRadius: 'var(--border-radius-xsm)', color: 'var(--colors-natural-300)', cursor: 'pointer', fontSize: 'var(--font-size-14)' }}>Add</button>
          </div>
        </div>

        {/* SEO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
          <div><label style={labelStyle}>Meta Title</label><input {...register('metaTitle')} style={inputStyle(false)} /></div>
          <div><label style={labelStyle}>Meta Description</label><input {...register('metaDesc')} style={inputStyle(false)} /></div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--colors-vulcan-700)' }}>
          <select {...register('status')} style={{ padding: 'var(--space-10) var(--space-16)', backgroundColor: 'var(--colors-vulcan-950)', border: '1px solid var(--colors-vulcan-700)', borderRadius: 'var(--border-radius-xsm)', color: 'var(--colors-natural-50)', fontSize: 'var(--font-size-14)', cursor: 'pointer' }}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button type="submit" disabled={isPending} style={{ backgroundColor: isPending ? 'var(--colors-vulcan-700)' : 'var(--colors-blue-600)', color: 'var(--colors-natural-50)', padding: 'var(--space-10) var(--space-24)', borderRadius: 'var(--border-radius-2xsm)', fontSize: 'var(--font-size-14)', fontWeight: '600', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer' }}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/blog')} style={{ backgroundColor: 'transparent', color: 'var(--colors-natural-400)', padding: 'var(--space-10) var(--space-16)', borderRadius: 'var(--border-radius-2xsm)', border: '1px solid var(--colors-vulcan-700)', cursor: 'pointer', fontSize: 'var(--font-size-14)' }}>
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
