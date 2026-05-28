# PROP UNIFIED — Setup Guide

## Requirements
- Node.js 20+ with npm 9+ (workspace support required)
- PostgreSQL 14+

## Quick Start

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in DATABASE_URL, SESSION_SECRET, and your Clerk keys

# 3. Push the database schema
npm --workspace=@workspace/db run push

# 4. Start the API server  (terminal 1)
npm --workspace=@workspace/api-server run dev

# 5. Start the frontend  (terminal 2)
npm --workspace=@workspace/prop-unified run dev
```

## Workspace layout

| Path | Description |
|------|-------------|
| `artifacts/prop-unified` | React + Vite + Tailwind frontend |
| `artifacts/api-server` | Express 5 REST API |
| `lib/db` | Drizzle ORM schema & migrations |
| `lib/api-spec` | OpenAPI spec (source of truth) |
| `lib/api-zod` | Generated Zod validation schemas |
| `lib/api-client-react` | Generated React Query hooks |
| `scripts` | Utility scripts |

## Regenerate API code (after editing lib/api-spec/openapi.yaml)

```bash
npm --workspace=@workspace/api-spec run codegen
```

## Full typecheck

```bash
npm run typecheck
```
