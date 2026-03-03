#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Nua Security CMS — One-Time Setup Script
# Run this once from the cms/backend directory
# ─────────────────────────────────────────────────────────────────────

set -e  # Exit on any error

echo ""
echo "🚀 Nua Security CMS — Setup"
echo "────────────────────────────────────────────"
echo ""

# ── Check Node.js ─────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

# ── Install dependencies ───────────────────────────────────────
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# ── Generate Prisma client ─────────────────────────────────────
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

# ── Run migrations (creates SQLite database) ───────────────────
echo ""
echo "🗄️  Creating database..."
npx prisma migrate dev --name init --skip-seed
echo "✅ Database created (dev.db)"

# ── Seed database ──────────────────────────────────────────────
echo ""
echo "🌱 Seeding database..."
npx ts-node prisma/seed.ts
echo ""

# ── Done ───────────────────────────────────────────────────────
echo "────────────────────────────────────────────"
echo "✅ Setup complete!"
echo ""
echo "▶  To start the CMS backend:"
echo "   npm run dev"
echo ""
echo "📡 API will be available at: http://localhost:3001"
echo "🔍 Health check: http://localhost:3001/health"
echo ""
echo "📋 API Endpoints:"
echo "   GET  /api/blog          → Published blog posts"
echo "   GET  /api/blog/:slug    → Single blog post"
echo "   GET  /api/pages/:slug   → Page content (home, pricing, etc.)"
echo "   POST /api/auth/login    → Admin login"
echo "────────────────────────────────────────────"
echo ""
