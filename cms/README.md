# Nua Security CMS

نظام إدارة المحتوى لموقع Nua Security.
مبني على **Fastify + TypeScript + Prisma + SQLite** (للتطوير) / PostgreSQL (للإنتاج).

---

## 🚀 التشغيل السريع (أول مرة)

```bash
cd cms/backend
chmod +x setup.sh
./setup.sh
```

هذا الأمر يعمل كل شيء تلقائياً:
- تثبيت npm packages
- توليد Prisma client
- إنشاء قاعدة البيانات (`dev.db`)
- إضافة admin user + مقالات تجريبية

### تشغيل يومي بعد الـ setup

```bash
cd cms/backend
npm run dev
# API متاح على: http://localhost:3001
```

---

## 🔑 بيانات الأدمن

```
Email:    admin@nuasecurity.com
Password: NuaAdmin2026!
URL:      http://localhost:3001
```

> ⚠️ غيّر الباسوورد فوراً بعد أول تسجيل دخول

---

## 🔗 ربط Landing Pages بالـ CMS

صفحات اللاندنق بيج مربوطة تلقائياً:

| الصفحة | الوصف |
|--------|-------|
| `blog.html` | يجلب أحدث المقالات من API تلقائياً |
| `blog-post.html?slug=...` | يجلب مقالة بالـ slug من الـ URL |

**مثال:** `blog-post.html?slug=top-5-cybersecurity-threats-2026`

إذا الـ API مو شغّال → يعرض المحتوى الـ static تلقائياً.

---

## 🛠️ للإنتاج (Production)

1. شغّل PostgreSQL
2. في `prisma/schema.prisma`: غيّر `provider = "sqlite"` لـ `provider = "postgresql"`
3. في `.env`: غيّر `DATABASE_URL` لـ connection string الـ PostgreSQL
4. شغّل `npx prisma migrate deploy`
5. ضع secrets حقيقية في `.env`

---

## API Endpoints

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| POST | `/api/auth/logout` | Authenticated |
| POST | `/api/auth/logout-all` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| POST | `/api/auth/change-password` | Authenticated |

### Pages (landing page content)
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/pages` | Public |
| GET | `/api/pages/:slug` | Public |
| GET | `/api/pages/admin/all` | Editor+ |
| PUT | `/api/pages/:slug` | Editor+ |

### Blog
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/blog` | Public |
| GET | `/api/blog/:slug` | Public |
| GET | `/api/blog/admin/all` | Editor+ |
| POST | `/api/blog` | Editor+ |
| PATCH | `/api/blog/:id` | Editor+ |
| DELETE | `/api/blog/:id` | Admin only |

### Media
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/media` | Editor+ |
| POST | `/api/media/upload` | Editor+ |
| PATCH | `/api/media/:id` | Editor+ |
| DELETE | `/api/media/:id` | Admin only |

### Users (Team)
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/users` | Admin only |
| POST | `/api/users` | Admin only |
| PATCH | `/api/users/:id` | Admin only |
| DELETE | `/api/users/:id` | Admin only |
| GET | `/api/users/audit-log` | Admin only |

## Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Everything — content, media, team management, audit log |
| **EDITOR** | Create/edit/publish content, upload media. Own posts only for delete |
| **VIEWER** | Read-only — for clients or stakeholders |

## Security Features

- Argon2id password hashing (OWASP 2025 recommended)
- JWT access tokens (15 min TTL, in-memory storage)
- Refresh token rotation with theft detection (token family invalidation)
- Refresh tokens stored as SHA-256 hashes in DB (never plaintext)
- httpOnly + Secure + SameSite=Strict cookies
- Rate limiting: 5 login attempts per 15 min, 120 req/min globally
- Account lockout after 5 failed login attempts (15 min)
- Helmet.js security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS locked to allowed origins
- File upload validation by magic bytes (not extension)
- Files uploaded directly to Cloudinary (never stored on app server)
- Full audit log of all create/update/delete actions
- Generic auth error messages (no email enumeration)
- Timing-safe password comparison (dummy hash for non-existent users)
- Input validation with Zod on all endpoints
- HTML content sanitization (XSS prevention for blog content)
- All sessions invalidated on password change
