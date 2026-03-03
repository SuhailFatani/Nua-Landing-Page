/* ============================================================
   NUA CMS — SHARED ADMIN UTILITIES
   Handles: auth guard, token refresh, API wrapper, UI helpers
   ============================================================ */

const API = 'http://localhost:3001/api'

// ─── Auth ────────────────────────────────────────────────────
export function getAccessToken() {
  return sessionStorage.getItem('access_token')
}

export function getUser() {
  const raw = sessionStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function isLoggedIn() {
  return !!getAccessToken()
}

export function logout() {
  fetch(`${API}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    credentials: 'include',
  }).finally(() => {
    sessionStorage.clear()
    window.location.href = './login.html'
  })
}

// Guard: redirect to login if not authenticated
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = './login.html'
    return false
  }
  return true
}

// Guard: redirect if role not allowed
export function requireRole(...roles) {
  const user = getUser()
  if (!user || !roles.includes(user.role)) {
    showToast('You do not have permission to view this page.', 'error')
    setTimeout(() => window.location.href = './index.html', 1500)
    return false
  }
  return true
}

// ─── Token refresh ───────────────────────────────────────────
let refreshing = null

async function refreshAccessToken() {
  if (refreshing) return refreshing

  refreshing = fetch(`${API}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  }).then(async (res) => {
    if (!res.ok) {
      sessionStorage.clear()
      window.location.href = './login.html'
      throw new Error('Session expired')
    }
    const data = await res.json()
    sessionStorage.setItem('access_token', data.accessToken)
    return data.accessToken
  }).finally(() => {
    refreshing = null
  })

  return refreshing
}

// ─── Authenticated fetch wrapper ─────────────────────────────
export async function apiFetch(path, options = {}) {
  const token = getAccessToken()

  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  // Auto-refresh on 401
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken()
      const retryRes = await fetch(`${API}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...(options.headers || {}),
        },
      })
      return retryRes
    } catch {
      return res
    }
  }

  return res
}

// ─── Toast notifications ──────────────────────────────────────
let toastContainer = null

export function showToast(message, type = 'success', duration = 3500) {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)
  }

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.2s'
    setTimeout(() => toast.remove(), 200)
  }, duration)
}

// ─── SVG icons for sidebar ────────────────────────────────────
const ICONS = {
  dashboard: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  blog:      `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  pages:     `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  media:     `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  team:      `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  audit:     `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  logout:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
}

// ─── Render sidebar with active state ───────────────────────
export function renderSidebar(activePage) {
  const user = getUser()
  if (!user) return

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const nav = [
    { id: 'dashboard', href: 'index.html', icon: 'dashboard', label: 'Home' },
    { id: 'blog',      href: 'blog.html',  icon: 'blog',      label: 'Blog' },
    { id: 'pages',     href: 'pages.html', icon: 'pages',     label: 'Pages' },
    { id: 'media',     href: 'media.html', icon: 'media',     label: 'Media' },
    { id: 'team',      href: 'team.html',  icon: 'team',      label: 'Team',  adminOnly: true },
    { id: 'audit',     href: 'audit.html', icon: 'audit',     label: 'Audit', adminOnly: true },
  ]

  const sidebarEl = document.getElementById('sidebar')
  if (!sidebarEl) return

  const navHtml = nav.map(item => {
    if (item.adminOnly && user.role !== 'ADMIN') return ''
    return `
      <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}" title="${item.label}">
        ${ICONS[item.icon]}
        <span class="nav-label">${item.label}</span>
      </a>
    `
  }).join('')

  sidebarEl.innerHTML = `
    <div class="sidebar-logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="7" fill="#111827"/>
        <text x="14" y="20" font-family="DM Sans, sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">N</text>
      </svg>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-bottom">
      <button class="nav-item" onclick="logout()" title="Sign out" style="background:none;border:none;cursor:pointer;">
        <span style="color:#9ca3af;">${ICONS.logout}</span>
        <span class="nav-label">Logout</span>
      </button>
      <div class="nav-item" title="${user.name}" style="cursor:default;">
        <div style="width:28px;height:28px;border-radius:50%;background:#2563eb;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${initials}</div>
      </div>
    </div>
  `
}

// Make logout globally accessible
window.logout = logout
