# 🔄 Tech Stack Migration Prompt — Cursor IDE

> **الاستخدام:** انسخ هذا الـ Prompt بالكامل والصقه في Cursor (Agent Mode). قبل ما تبدأ، تأكد إنك فاتح مجلد المشروع القديم في Cursor.

---

## الـ Prompt:

```
You are a senior full-stack architect and migration specialist. Your task is to migrate my existing web application from its current tech stack to a completely new, modern tech stack. I am NOT a developer — I built this project using vibe coding with AI. I need you to handle everything.

---

## STEP 0: AUDIT THE CURRENT PROJECT (DO THIS FIRST)

Before writing ANY code, you MUST:

1. Read every file in this project — all folders, configs, components, pages, styles, APIs, and data models
2. Create a file called `MIGRATION_AUDIT.md` in the project root that documents:
   - Current tech stack (framework, language, styling, database, auth, APIs, deployment)
   - Full list of all pages/routes and what each one does
   - All data models / database schemas
   - All API endpoints and what they return
   - All third-party integrations (auth providers, payment, analytics, email, etc.)
   - All environment variables currently in use
   - Any external services or dependencies
3. After creating the audit, STOP and show me the audit before proceeding. Do NOT start migration until I confirm.

---

## STEP 1: MIGRATION PLAN

After I approve the audit, create a `MIGRATION_PLAN.md` that includes:

1. A phased migration plan (which parts to migrate first, second, etc.)
2. Mapping of every old component/page to its new equivalent
3. Data migration strategy (how to move data from old DB to Neo4j)
4. Risk assessment — what could break and how to prevent it
5. Rollback strategy in case something fails

Again, STOP and show me the plan before writing any code.

---

## STEP 2: BUILD THE NEW STACK

The new tech stack MUST be:

### Frontend
- **Next.js 15** (App Router) — React framework for the UI
- **TypeScript** — strictly typed, no `any` types allowed
- **TanStack Query v5** (React Query) — for ALL data fetching, caching, and server state management. Every API call must go through TanStack Query hooks (useQuery, useMutation). No raw fetch() or axios calls in components.
- **TanStack Table** (if the project has any tables/data grids) — for sortable, filterable, paginated tables
- **Tailwind CSS v4** — for all styling (utility-first)
- **shadcn/ui** — as the component library (install only components that are needed)
- **Zod** — for all form validation and schema validation
- **React Hook Form** — for all forms, integrated with Zod
- **next-intl** or **next-i18n** — if the project has any multi-language support
- **Framer Motion** — for animations (only if the old project had animations)

### Backend
- **Django 5** (Python) — as the backend framework
- **Django REST Framework (DRF)** — for building REST APIs
- **Django Ninja** — as an alternative if the API is simple (choose one: DRF or Ninja, not both)
- **Neomodel** — Django OGM (Object Graph Mapper) for Neo4j
- **Django CORS Headers** — for handling CORS between Next.js frontend and Django backend
- **Django Simple JWT** — for JWT authentication (if auth exists in current project)
- **Celery + Redis** — for background tasks (only if the old project has async jobs, emails, etc.)
- **Python-dotenv** — for environment variable management

### Database
- **Neo4j** (Graph Database) — as the primary database
- **Neo4j Desktop or AuraDB** — for database hosting
- If the current project has relational data, you MUST redesign the data model as a graph model:
  - Entities become Nodes (with labels)
  - Relationships become Edges (with types and properties)
  - Create a `DATA_MODEL.md` showing the graph schema with node labels, relationship types, and properties

### DevOps / Tooling
- **Docker + Docker Compose** — for local development (Next.js + Django + Neo4j containers)
- **ESLint + Prettier** — for frontend code quality
- **Ruff** — for Python/Django linting
- **Husky + lint-staged** — for pre-commit hooks

---

## STEP 3: PROJECT STRUCTURE

Create this exact folder structure:

```
project-root/
├── frontend/                    # Next.js 15 App
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── (routes)/       # Grouped route folders
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layout/         # Header, Footer, Sidebar, etc.
│   │   │   └── features/       # Feature-specific components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts          # API client (axios instance with base URL)
│   │   │   ├── queryClient.ts  # TanStack Query client config
│   │   │   └── utils.ts        # Shared utilities
│   │   ├── services/           # TanStack Query hooks organized by feature
│   │   │   ├── useAuth.ts
│   │   │   ├── useUsers.ts
│   │   │   └── ...
│   │   ├── types/              # TypeScript type definitions
│   │   ├── stores/             # Zustand stores (only for client state, NOT server state)
│   │   └── validators/         # Zod schemas
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Django 5 App
│   ├── config/                  # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/              # User management app
│   │   ├── core/               # Core business logic app
│   │   └── ...                 # One app per domain/feature
│   ├── requirements.txt
│   └── manage.py
│
├── docker-compose.yml
├── .env.example
├── MIGRATION_AUDIT.md
├── MIGRATION_PLAN.md
├── DATA_MODEL.md
└── README.md
```

---

## STEP 4: IMPLEMENTATION RULES

Follow these rules strictly:

### General
- Migrate feature by feature, NOT all at once
- After each feature migration, verify it works before moving to the next
- Keep the same visual design and UX — do NOT change how things look unless I ask
- Preserve ALL functionality — nothing should be lost in migration
- Every file must have clear comments explaining what it does

### Frontend Rules
- ALL data fetching MUST use TanStack Query — no exceptions
- Create custom hooks in `/services/` for every API endpoint:
  ```typescript
  // Example: services/useUsers.ts
  export const useUsers = () => {
    return useQuery({
      queryKey: ['users'],
      queryFn: () => api.get('/users/').then(res => res.data),
    });
  };
  ```
- Use query invalidation for mutations — after any POST/PUT/DELETE, invalidate related queries
- Server state (API data) = TanStack Query. Client state (UI state like modals, sidebar) = Zustand or useState
- ALL forms must use React Hook Form + Zod validation
- Components should be small, reusable, and typed with TypeScript interfaces
- Use Next.js App Router conventions: layout.tsx, page.tsx, loading.tsx, error.tsx
- Implement proper loading states and error boundaries for every page

### Backend Rules
- Django apps should be organized by domain (users, products, orders, etc.)
- Every API endpoint must have proper serialization, validation, and error handling
- Use Neomodel for all Neo4j interactions — define StructuredNode classes for all entities
- Implement proper authentication middleware
- Add rate limiting on sensitive endpoints
- Write clear docstrings for every view and serializer
- Use Django's built-in logging

### Database Rules
- Design the Neo4j graph model BEFORE writing any backend code
- Every node must have a unique identifier (uid using neomodel's UniqueIdProperty)
- Define all relationships with proper cardinality
- Create Cypher indexes for frequently queried properties
- If migrating from SQL: map foreign keys to relationships, join tables to relationship properties

---

## STEP 5: ENVIRONMENT & CONFIGURATION

Create a `.env.example` with ALL required environment variables:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Backend
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Neo4j
NEO4J_BOLT_URL=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# Auth (if applicable)
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# Add any other env vars from the old project
```

---

## STEP 6: DOCKER SETUP

Create a `docker-compose.yml` that runs:
1. Next.js frontend (port 3000)
2. Django backend (port 8000)
3. Neo4j database (ports 7474 for browser, 7687 for bolt)
4. Redis (port 6379, only if Celery is needed)

With hot-reload enabled for both frontend and backend during development.

---

## STEP 7: FINAL CHECKLIST

Before saying the migration is complete, verify:

- [ ] Every page from the old app exists in the new app
- [ ] Every API endpoint works and returns correct data
- [ ] All forms submit correctly with validation
- [ ] Authentication works (login, logout, register, password reset)
- [ ] All data has been migrated to Neo4j
- [ ] TanStack Query is used for ALL data fetching (no raw fetch/axios in components)
- [ ] Loading states and error handling exist on every page
- [ ] The app builds without errors (`npm run build` + `python manage.py check`)
- [ ] Docker Compose starts all services correctly
- [ ] Environment variables are documented in .env.example
- [ ] README.md has setup instructions that a non-developer can follow

---

## IMPORTANT NOTES

- I am NOT a developer. Explain any decisions you make in simple terms.
- If something from the old stack doesn't have an equivalent or doesn't need migration, tell me WHY and suggest alternatives.
- If you encounter something you're unsure about, ASK ME before making assumptions.
- DO NOT skip any functionality. If the old app has it, the new app must have it.
- After completing the migration, create a simple README.md with step-by-step instructions to run the project locally (written for someone who is NOT a developer).
- Work incrementally. Show me progress after each major step.
```

---

## 📋 ملاحظات إضافية للاستخدام في Cursor

### كيف تستخدم هذا الـ Prompt:

1. **افتح المشروع القديم** في Cursor
2. **استخدم Agent Mode** (مو Ask Mode)
3. **الصق الـ Prompt** بالكامل في الـ chat
4. **انتظر الـ Audit** — لا توافق حتى تراجع الملف
5. **راجع الـ Migration Plan** — لا توافق حتى تفهم الخطة
6. **بعد كل خطوة** — تأكد إن كل شي شغّال قبل ما تنتقل للخطوة اللي بعدها

### نصائح مهمة:

- **احفظ Git commit** قبل ما تبدأ عشان لو صار أي مشكلة ترجع
- لو الـ AI توقف أو ضاع، **افتح chat جديد** والصق الـ prompt مع ملاحظة "continue from Step X"
- **لا تعطيه كل الملفات مرة وحدة** — خله يقرأ المشروع بنفسه
- لو عندك **.cursorrules** ملف، حط فيه هذا:

```
Tech Stack: Next.js 15 + TanStack Query v5 + Django 5 + Neo4j
Language: TypeScript (frontend), Python (backend)
Styling: Tailwind CSS v4 + shadcn/ui
All data fetching must use TanStack Query hooks
All forms must use React Hook Form + Zod
Follow the project structure defined in MIGRATION_PLAN.md
```
