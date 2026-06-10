# PROP UNIFIED — Security Architecture Blueprint

**Document type:** Security Architecture, Design Principles & Implementation Plan  
**Scope:** Full platform — API server, frontend SPA, database, auth, infrastructure  
**Author:** Shreyas Vivek  
**Version:** 1.0 — June 2026  
**Status:** Active — Foundation document for all development

---

## Table of Contents

1. [Current State — Critical Vulnerabilities in Live Code](#1-current-state--critical-vulnerabilities-in-live-code)
2. [Architecture Philosophy & Security Principles](#2-architecture-philosophy--security-principles)
3. [Target Architecture Overview](#3-target-architecture-overview)
4. [Data Architecture & Classification](#4-data-architecture--classification)
5. [Authentication & Identity Architecture](#5-authentication--identity-architecture)
6. [Authorisation Architecture — Zero Trust, RBAC, ABAC](#6-authorisation-architecture--zero-trust-rbac-abac)
7. [API Security Architecture](#7-api-security-architecture)
8. [Database Security Architecture](#8-database-security-architecture)
9. [Frontend Security Architecture](#9-frontend-security-architecture)
10. [Infrastructure Security Architecture](#10-infrastructure-security-architecture)
11. [KYC & Sensitive Data Architecture](#11-kyc--sensitive-data-architecture)
12. [Payment Security Architecture](#12-payment-security-architecture)
13. [Audit, Observability & Incident Response Architecture](#13-audit-observability--incident-response-architecture)
14. [Secure Development Lifecycle](#14-secure-development-lifecycle)
15. [Compliance Mapping to Architecture](#15-compliance-mapping-to-architecture)
16. [Implementation Roadmap](#16-implementation-roadmap)

---

## 1. Current State — Critical Vulnerabilities in Live Code

> Read the code before reading anything else. This section documents what was found in the current POC codebase so every fix has an exact file reference.

### 1.1 Vulnerability Inventory

| Severity | Vulnerability | File | Line | Impact |
|----------|--------------|------|------|--------|
| CRITICAL | CORS `origin: true` — mirrors every origin with credentials | `artifacts/api-server/src/app.ts` | 39 | Any site can make credentialed cross-origin requests to your API |
| CRITICAL | BOLA — no ownership check on `GET/PATCH/DELETE /listings/:id` | `artifacts/api-server/src/routes/listings.ts` | 83, 102, 149 | Any user reads/modifies/deletes any other user's listing |
| CRITICAL | `GET /listings` returns ALL listings regardless of caller | `artifacts/api-server/src/routes/listings.ts` | 29 | Agents see each other's entire listing portfolios |
| CRITICAL | PAN + Aadhaar stored as plaintext columns | `lib/db/src/schema/kyc.ts` | 8–9 | Any DB read exposes identity documents; Aadhaar Act violation |
| CRITICAL | `ownerPhone` returned in every `GET /properties` response | `lib/api-spec/openapi.yaml` | 570 | Trivially scraped; DPDP breach at scale |
| CRITICAL | No authentication on `POST /properties`, `PATCH /properties/:id`, `DELETE /properties/:id` | `artifacts/api-server/src/routes/properties.ts` | all | Anonymous users can create/delete any property |
| CRITICAL | No authentication on `POST /inquiries` | `artifacts/api-server/src/routes/inquiries.ts` | 42 | Spam, lead harvesting without any identity |
| HIGH | `PATCH /users/me` accepts `role: admin` in body — role self-escalation | `lib/api-spec/openapi.yaml` | 829 | Any user can promote themselves to admin |
| HIGH | `sellerId` defaults to literal string `"anonymous"` | `artifacts/api-server/src/routes/listings.ts` | 51 | Listings created without real identity |
| HIGH | `GET /inquiries` returns ALL inquiries with no scoping | `artifacts/api-server/src/routes/inquiries.ts` | 22 | Any authenticated user reads all buyers' contact data |
| HIGH | `GET /dashboard/stats` returns platform-wide data with no auth | `artifacts/api-server/src/routes/dashboard.ts` | — | Business intelligence leaked to any caller |
| HIGH | Sequential integer IDs on all tables | `lib/db/src/schema/*.ts` | all | Enumeration — attacker iterates IDs to harvest all records |
| HIGH | No rate limiting on any endpoint | `artifacts/api-server/src/app.ts` | — | Brute force, scraping, DDoS with no resistance |
| HIGH | No security headers (CSP, HSTS, X-Content-Type-Options, etc.) | `artifacts/api-server/src/app.ts` | — | XSS, clickjacking, MIME sniffing attacks |
| MEDIUM | `createProperty` allows caller to set `ownerId`, `ownerName`, `ownerPhone` | `lib/api-spec/openapi.yaml` | 598 | Impersonation — user claims to own a property they don't |
| MEDIUM | Property descriptions and listing descriptions stored without sanitisation | all route files | — | Stored XSS if description rendered as HTML |
| MEDIUM | No request size limits | `artifacts/api-server/src/app.ts` | — | Memory exhaustion via large payloads |
| MEDIUM | `isPremium` can be set freely in POST/PATCH body — no payment gate | `artifacts/api-server/src/routes/listings.ts` | 53, 110 | Free premium listings by sending `isPremium: true` |

### 1.2 What This Means for a Production System

The current POC has a functional feature set but **zero security boundary enforcement**. Any person who knows the API URL can:
- Read every property owner's phone number by calling `GET /api/properties`
- Read every buyer's name, phone, and email by calling `GET /api/inquiries`
- Read every seller's KYC including PAN and Aadhaar by calling `GET /api/kyc` (if they know any userId)
- Promote their account to admin by calling `PATCH /api/users/me` with `{"role":"admin"}`
- Delete any property by calling `DELETE /api/properties/:id`

This is the correct POC posture — move fast, validate the product. The architecture below is the path from here to production.

---

## 2. Architecture Philosophy & Security Principles

### 2.1 The Twelve Foundational Principles

These are non-negotiable. Every feature, every PR, every infrastructure decision is measured against them.

---

**Principle 1: Zero Trust**

> "Never trust, always verify." No component, service, user, or network is trusted by default — even inside your own infrastructure.

*In practice:*
- Every API request is authenticated and authorised independently, regardless of source
- Internal service-to-service calls use signed tokens, not network trust
- Database access is scoped per-query to the authenticated user's permissions
- Admin access requires separate identity verification even from internal networks

---

**Principle 2: Least Privilege**

> Every actor — user, service, database role, IAM policy — has only the permissions it needs for the specific task, and nothing more.

*In practice:*
- Supabase `anon` key can only read non-PII public data
- Supabase `service_role` key lives only on the API server, never in client code
- Each microservice has its own DB credential scoped to its tables
- Admin roles have expiry; elevated permissions require re-authentication

---

**Principle 3: Defence in Depth**

> No single control is sufficient. Assume each layer will fail and the next layer must catch it.

*In practice:*
- Edge: Cloudflare WAF blocks known attack patterns
- Transport: Auth middleware rejects unauthenticated requests
- Application: Ownership checks reject cross-tenant access
- Database: Row Level Security refuses even if application logic fails
- Monitoring: SIEM alerts on anomalies that slip through all layers

---

**Principle 4: Secure by Default**

> The default state of every new feature is the most restrictive. Permissions are explicitly granted, never assumed.

*In practice:*
- New API endpoints require authentication unless explicitly decorated `@public`
- New database tables have RLS enabled before any data is inserted
- New user accounts have role `buyer` — the lowest privilege
- New feature flags are off by default

---

**Principle 5: Explicit Authorisation**

> Authorisation is not a consequence of authentication. Knowing who you are does not tell the system what you may do. Both are checked on every request.

*In practice:*
- `isAuthenticated()` middleware verifies the JWT
- `canAccess(resource, action)` middleware verifies the permission
- These are two separate, composable checks on every protected route

---

**Principle 6: Data Minimisation**

> Collect only what is needed for a declared purpose. Return only what the caller needs for the declared operation.

*In practice:*
- `GET /properties` does not return `ownerPhone` — that requires a separate authenticated, rate-limited, logged action
- Analytics systems receive pseudonymised data, not raw PII
- Logs mask phone numbers and emails before writing

---

**Principle 7: Immutability of Audit**

> Security and access logs cannot be modified or deleted by application code. They are append-only and stored in a separate system.

*In practice:*
- Audit logs written to a separate append-only log store (S3 + CloudWatch or equivalent)
- Application code has no delete/update permissions on audit log tables
- Log integrity verified periodically

---

**Principle 8: Cryptographic Integrity**

> Sensitive data is encrypted at rest and in transit. Cryptographic operations use vetted, current algorithms. No secrets travel in plaintext.

*In practice:*
- PAN and Aadhaar: field-level encryption with AES-256-GCM, application-managed keys
- TLS 1.3 everywhere; no downgrades
- JWT signed with RS256; public key published for verification
- No secrets in environment variable names starting with `NEXT_PUBLIC_`

---

**Principle 9: Input Distrust**

> Every input from outside the system boundary — user input, API requests, file uploads, third-party webhooks, database reads of user-provided data — is untrusted until validated and sanitised.

*In practice:*
- All request bodies validated against Zod schemas (already partially done — keep this)
- HTML content sanitised with DOMPurify before storage and before render
- File uploads validated by magic bytes, not extension
- Webhook payloads verified by signature before processing

---

**Principle 10: Fail Secure**

> When a system component fails, it must fail into a secure state. Errors must not reveal internal system details to untrusted callers.

*In practice:*
- All unhandled errors return a generic `{ error: "Internal server error" }` — never stack traces to clients
- Auth failures return 401; authorisation failures return 403 (not 401, which would confirm the resource exists)
- Database connection failures result in 503, not database error messages

---

**Principle 11: Non-Repudiation**

> Every significant action is tied to an authenticated identity and timestamped in a tamper-evident log. Users and operators cannot deny having performed actions.

*In practice:*
- Every create/update/delete action carries `actorId`, `timestamp`, `ipAddress`, `userAgent`
- Sensitive operations (contact reveal, KYC approval, premium grant) have their own audit event type
- Audit trail is separate from application logs

---

**Principle 12: Privacy by Design**

> Privacy is a design constraint, not an afterthought. Data flows are modelled and privacy impact is assessed before features are built.

*In practice:*
- Every new table requires a declared retention period before it is created
- PII fields are explicitly annotated in the schema
- Contact reveal is a deliberate, gated, logged action — not a side effect of reading a listing

---

### 2.2 Security Architecture Patterns Used

| Pattern | Where Applied |
|---------|--------------|
| **Gateway Pattern** | Cloudflare sits in front of everything; single entry point for all traffic |
| **Token-based Identity** | Clerk JWT — stateless, short-lived, cryptographically signed |
| **Resource-Based Access Control** | Ownership checks on every record operation |
| **RBAC** | Role hierarchy for feature-level permissions |
| **Proxy Phone Numbers** | Real owner numbers never exposed; proxy numbers mediate calls |
| **Read Model / Write Model separation** | Public read endpoints return sanitised projections; write endpoints require full auth |
| **Outbox / Event Log** | Audit events written atomically with business events |
| **Defense in Depth via Middleware Chain** | Rate limit → Auth → Authorise → Validate → Business Logic → Sanitise Output |

---

## 3. Target Architecture Overview

### 3.1 System Component Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                                      │
│  WAF · Bot Mgmt · DDoS · Rate Limit · TLS 1.3 · Security Headers            │
│  Zero Trust (Access) for admin surfaces                                      │
└───────────────────────────┬─────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐
│  FRONTEND SPA   │  │  API SERVER  │  │   ADMIN PANEL     │
│  React / Vite   │  │  Express.js  │  │  (Separate app)   │
│  Vercel         │  │  Render      │  │  Zero Trust gated │
│                 │  │              │  │  MFA required     │
│  ┌───────────┐  │  │ ┌──────────┐ │  └───────────────────┘
│  │Auth (Clerk│  │  │ │Rate Limit│ │
│  │ SDK)      │  │  │ │Auth MW   │ │
│  │CSP Headers│  │  │ │Authz MW  │ │
│  │No PII in  │  │  │ │Validate  │ │
│  │bundle     │  │  │ │Sanitise  │ │
│  └───────────┘  │  │ └────┬─────┘ │
└─────────────────┘  └──────┼───────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   CLERK AUTH    │  │  POSTGRESQL  │  │  OBJECT STORAGE  │
│   (External)    │  │  Supabase    │  │  S3 / Supabase   │
│                 │  │  ap-south-1  │  │  Storage         │
│  JWT issuance   │  │              │  │                  │
│  Session mgmt   │  │  RLS enabled │  │  Property photos │
│  OAuth flows    │  │  on all      │  │  KYC documents   │
│                 │  │  PII tables  │  │  Signed URLs     │
└─────────────────┘  │              │  │  AV scanned      │
                     │  Encrypted   │  └──────────────────┘
                     │  PAN/Aadhaar │
                     │  at field    │
                     │  level       │
                     └──────────────┘

                     ┌──────────────┐  ┌──────────────────┐
                     │   RAZORPAY   │  │  AUDIT LOG STORE │
                     │   (Payments) │  │  Append-only     │
                     │   PCI DSS L1 │  │  S3 + immutable  │
                     │   Hosted     │  │  1yr retention   │
                     │   checkout   │  │                  │
                     └──────────────┘  └──────────────────┘
```

### 3.2 Request Flow — Every API Call

```
Client Request
     │
     ▼
[1] Cloudflare Edge
     ├── WAF: Block known attack signatures
     ├── Rate limit: Per-IP and per-token limits
     ├── Bot detection: Challenge suspicious traffic
     └── TLS termination: Enforce TLS 1.3
     │
     ▼
[2] Express Middleware Chain (runs in order)
     ├── Security headers (helmet)
     ├── Request size limit (100kb default)
     ├── Rate limiter (express-rate-limit per IP + per user)
     ├── CORS (explicit allowlist of origins)
     ├── Body parser (JSON)
     └── Request ID (for log correlation)
     │
     ▼
[3] Authentication Middleware
     ├── Extract Bearer token from Authorization header
     ├── Verify JWT signature (Clerk public key)
     ├── Check token expiry
     ├── Extract userId, sessionId, role claims
     └── Attach to req.auth — or reject 401
     │
     ▼
[4] Route Handler Entry
     ├── Authorisation check: does this role allow this action?
     ├── Resource ownership check: does this user own this resource?
     └── Reject 403 if either fails
     │
     ▼
[5] Input Validation (Zod)
     ├── Parse and validate request body against schema
     ├── Strip unknown fields (no extra properties pass through)
     └── Reject 422 with structured errors if invalid
     │
     ▼
[6] Business Logic
     ├── DB access through Drizzle (parameterised — no SQL injection)
     ├── Always scope queries to req.auth.userId
     └── RLS at DB layer as second defence
     │
     ▼
[7] Output Sanitisation
     ├── Strip PII fields not needed by caller (ownerPhone from public endpoints)
     ├── Mask sensitive fields in audit logs
     └── Encode user-generated content before return
     │
     ▼
[8] Audit Log
     ├── Write event: actor, action, resource, outcome, timestamp, IP
     └── Async, non-blocking (must not affect response time)
     │
     ▼
Response to Client
```

---

## 4. Data Architecture & Classification

### 4.1 Schema Redesign Principles

**Use UUIDs, not sequential integers.** Sequential integer IDs are an enumeration attack waiting to happen. Every table's public-facing ID must be a UUID v4.

```typescript
// lib/db/src/schema/base.ts
import { uuid, timestamp } from "drizzle-orm/pg-core";

// Every table gets this base
export const baseColumns = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
// Internal serial IDs are fine for DB-level FK references and ordering,
// but the external-facing "id" exposed in APIs must be UUID.
```

**Annotate every PII field.** Use a naming convention and JSDoc annotation to make PII explicit in the schema. This feeds into automated DPDP compliance tooling.

```typescript
// lib/db/src/schema/annotations.ts
/**
 * Mark a column as containing Personal Identifiable Information.
 * Used by:
 * - RoPA generator
 * - Erasure job (knows which columns to NULL on deletion)
 * - Log masking middleware
 * - Data export generator
 */
export type PiiField = string; // brand type for documentation
```

### 4.2 Data Classification Table

| Table | Columns | Classification | Encryption | Access Pattern |
|-------|---------|---------------|------------|----------------|
| `users` | `email`, `phone`, `full_name` | Confidential PII | At-rest (Postgres) | Owner + Admin only |
| `kyc` | `pan_number`, `aadhaar_number` | Restricted — SPDI | Field-level AES-256-GCM | Owner + KYC Admin only |
| `kyc` | `address`, `city`, `pincode` | Confidential PII | At-rest | Owner + KYC Admin only |
| `properties` | `owner_id` | Internal | At-rest | Auth users (linked to listings) |
| `properties` | `owner_phone` | **Never in API response** | At-rest | Internal lookup only |
| `inquiries` | `name`, `phone`, `email` | Confidential PII | At-rest | Property owner + Admin |
| `listings` | `seller_id`, `asking_price` | Internal | At-rest | Owner + Admin |
| `audit_log` | all | Internal | At-rest | Admin (read-only) |

### 4.3 Revised Database Schema

The schema needs the following structural changes before production:

```typescript
// lib/db/src/schema/properties.ts — REVISED

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, index } from "drizzle-orm/pg-core";

export const propertiesTable = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Public display fields
  title: text("title").notNull(),
  description: text("description"),         // HTML-sanitised before insert
  type: text("type").notNull(),
  propertyCategory: text("property_category"),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  priceUnit: text("price_unit").notNull().default("INR"),
  city: text("city").notNull(),
  locality: text("locality"),
  area: numeric("area", { precision: 10, scale: 2 }).notNull(),
  areaUnit: text("area_unit").notNull().default("sqft"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  furnishing: text("furnishing"),
  amenities: text("amenities"),             // JSON array stored as text
  photosJson: text("photos_json"),          // JSON array of S3 keys (NOT public URLs)
  
  // Compliance fields
  reraNumber: text("rera_number"),          // GujRERA registration number
  reraVerifiedAt: timestamp("rera_verified_at", { withTimezone: true }),
  
  // Status
  featured: boolean("featured").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  
  // Ownership — NEVER returned in public API responses
  ownerId: text("owner_id").notNull(),      // Clerk userId
  // ownerName and ownerPhone REMOVED from this table.
  // Looked up from users table via ownerId when needed by authorised callers.
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  ownerIdx: index("properties_owner_idx").on(table.ownerId),
  cityTypeIdx: index("properties_city_type_idx").on(table.city, table.type),
  statusIdx: index("properties_status_idx").on(table.status),
}));
```

```typescript
// lib/db/src/schema/kyc.ts — REVISED (PAN/Aadhaar encrypted)

import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const kycTable = pgTable("kyc", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),   // Clerk userId
  fullName: text("full_name"),
  
  // SPDI — stored encrypted at application layer
  // Actual value is: base64(IV || AES-256-GCM(plaintext, DEK))
  panNumberEnc: text("pan_number_enc"),          // encrypted PAN
  aadhaarNumberEnc: text("aadhaar_number_enc"),  // encrypted Aadhaar
  aadhaarLast4: text("aadhaar_last4"),           // unencrypted last 4 digits for display only
  panFirst5: text("pan_first5"),                 // unencrypted first 5 chars for display
  
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  phone: text("phone"),
  email: text("email"),
  
  status: text("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by"),               // admin userId
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  notes: text("notes"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("kyc_user_idx").on(table.userId),
}));
```

```typescript
// lib/db/src/schema/inquiries.ts — REVISED

import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const inquiriesTable = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  propertyId: uuid("property_id").notNull(),  // FK to properties.id
  listingId: uuid("listing_id"),              // FK to listings.id (for seller scoping)
  
  // Buyer identity
  buyerUserId: text("buyer_user_id"),         // Clerk userId if authenticated
  name: text("name").notNull(),
  phone: text("phone").notNull(),             // Consider proxy number masking
  email: text("email"),
  message: text("message"),
  
  status: text("status").notNull().default("new"),
  
  // For audit trail
  ipHash: text("ip_hash"),                    // SHA-256 of IP (not raw IP for privacy)
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  propertyIdx: index("inquiries_property_idx").on(table.propertyId),
  listingIdx: index("inquiries_listing_idx").on(table.listingId),
}));
```

---

## 5. Authentication & Identity Architecture

### 5.1 Auth Stack Decision

**Keep Clerk.** It handles OAuth, OTP, session management, and device tracking — building this in-house is high risk and high cost. The Clerk proxy middleware already in place is the right pattern.

**What Clerk gives you:**
- Phone OTP + Google/Facebook OAuth out of the box
- Short-lived JWT access tokens (signed with Clerk's RS256 key)
- Refresh token rotation
- Session revocation on logout
- Device management
- Brute-force protection on OTP

**What you must enforce on top of Clerk:**
- Role claims are stored in your database, not Clerk's JWT (never trust role claims from the client JWT alone — always verify from DB)
- Session context (device fingerprint) checked on sensitive operations
- Inactivity timeout enforced server-side

### 5.2 JWT Verification Pattern

```typescript
// artifacts/api-server/src/middlewares/authenticate.ts

import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthContext {
  clerkUserId: string;
  dbUserId: string;
  role: string;
  kycStatus: string | null;
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

/**
 * Requires a valid Clerk session. Attaches authContext to req.
 * Always check req.authContext — never (req as any).auth
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  
  if (!auth.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Always fetch role from DB — never trust role claims in JWT
  // A user could embed a custom role claim in a forged/modified session
  const [user] = await db
    .select({
      id: usersTable.id,
      role: usersTable.role,
      kycStatus: usersTable.kycStatus,
    })
    .from(usersTable)
    .where(eq(usersTable.clerkId, auth.userId))
    .limit(1);

  if (!user) {
    // First-time user: auto-provision with lowest-privilege role
    const [newUser] = await db
      .insert(usersTable)
      .values({ clerkId: auth.userId, role: "buyer" })
      .returning({ id: usersTable.id, role: usersTable.role, kycStatus: usersTable.kycStatus });
    
    req.authContext = {
      clerkUserId: auth.userId,
      dbUserId: newUser.id,
      role: newUser.role,
      kycStatus: newUser.kycStatus,
    };
  } else {
    req.authContext = {
      clerkUserId: auth.userId,
      dbUserId: user.id,
      role: user.role,
      kycStatus: user.kycStatus,
    };
  }

  next();
}

/**
 * Optional auth: attaches authContext if token is present, proceeds without it if not.
 * Use for public endpoints that behave differently for authenticated users.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth.userId) {
    next();
    return;
  }
  return requireAuth(req, res, next);
}
```

### 5.3 Role Hierarchy

```
admin
  └── platform-level access: all data, user management, KYC approval, platform config
      
moderator
  └── content: listing review, flagged content, RERA verification
  
agent (RERA-registered)
  └── own listings: CRUD own listings, see own inquiries, access seller dashboard
  └── promoted: can be verified, badge shown, higher trust in search
  
seller (individual property owner)
  └── own listings: CRUD own listings, see inquiries on own properties
  
buyer (default role on signup)
  └── browse: view listings, submit inquiries, save searches, manage own profile
```

**Role promotion rules:**
- `buyer` → `seller`: self-service, requires phone verification
- `seller` → `agent`: requires RERA registration upload + admin approval
- `agent` → `moderator`: admin-only grant
- Any role → `admin`: admin-only grant, requires hardware MFA setup

**Critical rule — role promotion is server-side only:**
```typescript
// NEVER allow role changes through the user-facing PATCH /users/me endpoint
// Role changes go through a separate /admin/users/:id/role endpoint
// UserUpdate schema must NOT include 'role' field

// lib/api-spec/openapi.yaml — UserUpdate MUST be:
// UserUpdate:
//   type: object
//   properties:
//     fullName: { type: string }
//     phone: { type: string }
//     avatarUrl: { type: string }
//   # role is intentionally ABSENT
```

---

## 6. Authorisation Architecture — Zero Trust, RBAC, ABAC

### 6.1 Two-Layer Authorisation

Every protected endpoint runs two independent checks:

**Layer 1 — Role-Based (RBAC):** Does this role type have permission to perform this action category?
**Layer 2 — Resource-Based (Ownership / ABAC):** Does this specific user own or have access to this specific resource?

Both must pass. RBAC alone is not sufficient.

```typescript
// artifacts/api-server/src/middlewares/authorise.ts

import type { Request, Response, NextFunction } from "express";

type Role = "buyer" | "seller" | "agent" | "moderator" | "admin";
type Action = "read:own" | "read:any" | "write:own" | "write:any" | "delete:own" | "delete:any" | "admin:*";

// Permission matrix — what each role can do at the feature level
const PERMISSIONS: Record<Role, Set<Action>> = {
  buyer:     new Set(["read:own"]),
  seller:    new Set(["read:own", "write:own", "delete:own"]),
  agent:     new Set(["read:own", "write:own", "delete:own"]),
  moderator: new Set(["read:own", "write:own", "delete:own", "read:any", "write:any"]),
  admin:     new Set(["read:own", "write:own", "delete:own", "read:any", "write:any", "delete:any", "admin:*"]),
};

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.authContext?.role as Role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export function requirePermission(action: Action) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.authContext?.role as Role;
    if (!userRole || !PERMISSIONS[userRole]?.has(action)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
```

### 6.2 Ownership Check Pattern (fixes BOLA)

```typescript
// artifacts/api-server/src/middlewares/ownership.ts

import { db } from "@workspace/db";
import { listingsTable, propertiesTable, inquiriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

/**
 * Verifies the requesting user owns the listing at req.params.id.
 * Attach after requireAuth. Admins and moderators bypass ownership.
 */
export async function requireListingOwnership(req: Request, res: Response, next: NextFunction) {
  const role = req.authContext?.role;
  
  // Admins and moderators can access any resource
  if (role === "admin" || role === "moderator") {
    next();
    return;
  }

  const listingId = req.params.id;
  const userId = req.authContext?.clerkUserId;

  const [listing] = await db
    .select({ sellerId: listingsTable.sellerId })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    // Return 404 not 403 — don't confirm resource existence to non-owner
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (listing.sellerId !== userId) {
    // Return 404 not 403 — information leakage via status code
    res.status(404).json({ error: "Not found" });
    return;
  }

  next();
}

export async function requirePropertyOwnership(req: Request, res: Response, next: NextFunction) {
  const role = req.authContext?.role;
  if (role === "admin" || role === "moderator") {
    next();
    return;
  }

  const propertyId = req.params.id;
  const userId = req.authContext?.clerkUserId;

  const [property] = await db
    .select({ ownerId: propertiesTable.ownerId })
    .from(propertiesTable)
    .where(eq(propertiesTable.id, propertyId))
    .limit(1);

  if (!property || property.ownerId !== userId) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  next();
}
```

### 6.3 Revised Route Definitions with Full Authz

```typescript
// artifacts/api-server/src/routes/listings.ts — SECURE VERSION

import { Router } from "express";
import { requireAuth } from "../middlewares/authenticate";
import { requireListingOwnership } from "../middlewares/ownership";
import { requireRole } from "../middlewares/authorise";
import { rateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// GET /listings — only the caller's own listings
router.get(
  "/",
  requireAuth,                              // must be authenticated
  rateLimiter({ max: 60, windowMs: 60_000 }),
  async (req, res) => {
    const sellerId = req.authContext!.clerkUserId;
    
    // Scope to current user — admins pass a ?userId= query
    const listings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.sellerId, sellerId));
    
    res.json(listings.map(sanitiseListing));
  }
);

// POST /listings — sellers and agents can create
router.post(
  "/",
  requireAuth,
  requireRole("seller", "agent", "admin"),
  rateLimiter({ max: 10, windowMs: 60_000 }),
  async (req, res) => {
    const body = CreateListingBody.parse(req.body);
    const sellerId = req.authContext!.clerkUserId;  // always from token, never from body
    
    // ... create listing with sellerId locked to authenticated user
  }
);

// GET /listings/:id — owner or admin only
router.get(
  "/:id",
  requireAuth,
  requireListingOwnership,                  // BOLA fix
  rateLimiter({ max: 100, windowMs: 60_000 }),
  async (req, res) => { /* ... */ }
);

// PATCH /listings/:id — owner or admin only
router.patch(
  "/:id",
  requireAuth,
  requireListingOwnership,                  // BOLA fix
  rateLimiter({ max: 20, windowMs: 60_000 }),
  async (req, res) => { /* ... */ }
);

// DELETE /listings/:id — owner or admin only
router.delete(
  "/:id",
  requireAuth,
  requireListingOwnership,                  // BOLA fix
  requireRole("seller", "agent", "admin"),
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => { /* ... */ }
);
```

---

## 7. API Security Architecture

### 7.1 The Secure App Bootstrap

This replaces the current `app.ts` entirely:

```typescript
// artifacts/api-server/src/app.ts — SECURE VERSION

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { clerkMiddleware } from "@clerk/express";
import pinoHttp from "pino-http";
import { requestId } from "./middlewares/requestId";
import { errorHandler } from "./middlewares/errorHandler";
import router from "./routes";
import { logger } from "./lib/logger";

const app = express();

// ── 1. Trust proxy (Cloudflare / Render) ──────────────────────────────────
app.set("trust proxy", 1);

// ── 2. Request ID (for log correlation) ───────────────────────────────────
app.use(requestId());

// ── 3. Security headers (helmet) ──────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https://your-cdn.com"],
        connectSrc: ["'self'"],
        frameSrc:   ["'none'"],
        objectSrc:  ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    noSniff: true,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ── 4. CORS — explicit allowlist, not origin: true ────────────────────────
const ALLOWED_ORIGINS = [
  "https://propunified-prop-unified.vercel.app",
  "https://www.propunified.in",    // production domain
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:5173", "http://localhost:3000"]
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, Postman in dev)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    maxAge: 86400,  // preflight cache 24h
  })
);

// ── 5. Body parsing with size limits ──────────────────────────────────────
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ── 6. Global rate limit (outer boundary) ─────────────────────────────────
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,                   // 300 requests/min per IP globally
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
    keyGenerator: (req) => req.ip ?? "unknown",
  })
);

// ── 7. Request logging (structured, no PII in default serialiser) ─────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url.split("?")[0],   // strip query params (may contain PII)
        userAgent: req.headers["user-agent"]?.substring(0, 100),
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

// ── 8. Clerk proxy (must be before clerkMiddleware) ───────────────────────
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// ── 9. Clerk JWT verification ─────────────────────────────────────────────
app.use(clerkMiddleware());

// ── 10. Routes ────────────────────────────────────────────────────────────
app.use("/api", router);

// ── 11. 404 handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── 12. Global error handler (never leaks stack traces) ───────────────────
app.use(errorHandler);

export default app;
```

### 7.2 Rate Limiting Strategy

Different endpoints need different limits. A single global limit is not sufficient.

```typescript
// artifacts/api-server/src/middlewares/rateLimiter.ts

import rateLimit from "express-rate-limit";
import type { Request } from "express";

function keyByUserOrIp(req: Request): string {
  // Prefer user-scoped limiting (harder to bypass by rotating IPs)
  return req.authContext?.clerkUserId ?? req.ip ?? "unknown";
}

// Preset limiters for different risk categories

export const publicSearchLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,           // generous for search
  keyGenerator: (req) => req.ip ?? "unknown",
  message: { error: "Too many requests" },
});

export const contactRevealLimiter = rateLimit({
  windowMs: 60 * 60_000,    // 1 hour window
  max: 10,                  // max 10 contact reveals per user per hour
  keyGenerator: keyByUserOrIp,
  message: { error: "Contact reveal limit reached" },
  skipFailedRequests: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,    // 15 minute window
  max: 10,                  // 10 auth attempts per 15 min per IP
  keyGenerator: (req) => req.ip ?? "unknown",
  message: { error: "Too many authentication attempts" },
});

export const writeActionLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,                  // 20 writes per minute per authenticated user
  keyGenerator: keyByUserOrIp,
  message: { error: "Too many requests" },
});

export const kycSubmitLimiter = rateLimit({
  windowMs: 60 * 60_000,    // 1 hour
  max: 3,                   // 3 KYC submissions per hour max
  keyGenerator: keyByUserOrIp,
  message: { error: "Too many KYC submissions" },
});
```

### 7.3 Contact Reveal — The Critical Endpoint

The owner's phone number must **never** be returned in a standard listing response. It is revealed through a dedicated, gated, rate-limited, fully-audited endpoint.

```typescript
// artifacts/api-server/src/routes/contactReveal.ts

import { Router } from "express";
import { requireAuth } from "../middlewares/authenticate";
import { contactRevealLimiter } from "../middlewares/rateLimiter";
import { auditLog } from "../lib/auditLog";
import { db } from "@workspace/db";
import { propertiesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * POST /api/properties/:id/contact
 * 
 * Returns the owner's phone number for a specific property.
 * Requirements:
 * - Must be authenticated
 * - Rate limited to 10/hour per user
 * - Full audit trail: who revealed what, when, from where
 * - Phone number returned once; not cached in listing response
 * 
 * Future enhancement: return a proxy number (Exotel/Servetel) instead of real number
 */
router.post(
  "/properties/:id/contact",
  requireAuth,
  contactRevealLimiter,
  async (req, res) => {
    const propertyId = req.params.id;
    const requestingUser = req.authContext!;

    const [property] = await db
      .select({
        id: propertiesTable.id,
        ownerId: propertiesTable.ownerId,
        status: propertiesTable.status,
      })
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .limit(1);

    if (!property || property.status !== "active") {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Don't reveal your own contact details to yourself (odd but handle it)
    const [owner] = await db
      .select({ phone: usersTable.phone, fullName: usersTable.fullName })
      .from(usersTable)
      .where(eq(usersTable.clerkId, property.ownerId))
      .limit(1);

    if (!owner?.phone) {
      res.status(404).json({ error: "Contact not available" });
      return;
    }

    // Audit every reveal — this is your DPDP processing record
    await auditLog({
      eventType: "contact_reveal",
      actorId: requestingUser.clerkUserId,
      resourceType: "property",
      resourceId: propertyId,
      targetUserId: property.ownerId,
      metadata: {
        ipHash: hashIp(req.ip ?? ""),
        userAgent: req.headers["user-agent"]?.substring(0, 100),
      },
    });

    res.json({
      phone: owner.phone,
      name: owner.fullName,
      // Note: this is the real number; replace with proxy number in Phase 2
    });
  }
);
```

### 7.4 Input Sanitisation for Rich Text Fields

Any field that may contain user-generated content that gets rendered in a browser must be sanitised before storage:

```typescript
// artifacts/api-server/src/lib/sanitise.ts

import DOMPurify from "isomorphic-dompurify";

/**
 * Strip HTML from fields that should be plain text.
 * Use for: title, city, locality, name fields.
 */
export function stripHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Allow a safe subset of HTML for rich text fields.
 * Use for: property descriptions (allow basic formatting).
 */
export function sanitiseRichText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [],  // no attributes — prevents href injection, onclick, etc.
  });
}
```

### 7.5 Error Handler — Never Leak Internals

```typescript
// artifacts/api-server/src/middlewares/errorHandler.ts

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log full error internally
  req.log?.error({ err }, "Unhandled error");

  // Zod validation errors: safe to return, no internal info
  if (err instanceof ZodError) {
    res.status(422).json({
      error: "Validation failed",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // CORS errors: safe to name
  if (err instanceof Error && err.message.startsWith("CORS policy")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Everything else: generic 500 — never expose stack trace, DB error, etc.
  res.status(500).json({ error: "Internal server error" });
}
```

---

## 8. Database Security Architecture

### 8.1 Supabase Row Level Security

RLS is the last line of defence. Even if application logic has a bug, the database refuses cross-tenant access.

```sql
-- Run these migrations before inserting any data

-- ── Enable RLS on all PII tables ───────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;


-- ── Users table ────────────────────────────────────────────────────────────
-- Users see and modify only their own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id)
  WITH CHECK (auth.uid()::text = clerk_id);

-- Service role (server-side API) bypasses RLS — that's by design
-- anon role (public) gets NO access to users table


-- ── KYC table ──────────────────────────────────────────────────────────────
-- Users see only their own KYC; only service role can update status
CREATE POLICY "kyc_read_own" ON kyc
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "kyc_insert_own" ON kyc
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Only service_role can update KYC status (admin action — via API, never directly)
-- No UPDATE policy for authenticated users on KYC — status changes via admin API only


-- ── Properties table ───────────────────────────────────────────────────────
-- Public read of active properties (no ownerPhone — that column not in SELECT)
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT USING (status = 'active');

-- Owners can CRUD their own properties
CREATE POLICY "properties_owner_crud" ON properties
  FOR ALL USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);


-- ── Listings table ─────────────────────────────────────────────────────────
-- Sellers see and manage only their own listings
CREATE POLICY "listings_owner_crud" ON listings
  FOR ALL USING (auth.uid()::text = seller_id)
  WITH CHECK (auth.uid()::text = seller_id);


-- ── Inquiries table ────────────────────────────────────────────────────────
-- Buyers can read their own submitted inquiries
CREATE POLICY "inquiries_buyer_read" ON inquiries
  FOR SELECT USING (auth.uid()::text = buyer_user_id);

-- Property owners can read inquiries on their properties
CREATE POLICY "inquiries_property_owner_read" ON inquiries
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT owner_id FROM properties WHERE id = inquiries.property_id LIMIT 1
    )
  );

-- Inquiries can be inserted by authenticated and anonymous users (public inquiry form)
-- But rate limiting at API layer is the primary control; RLS permits the insert
CREATE POLICY "inquiries_insert" ON inquiries
  FOR INSERT WITH CHECK (true);


-- ── Audit log — append only, never readable by application users ────────────
-- Only service_role can insert; no SELECT policy for anon/authenticated
CREATE POLICY "audit_log_insert_only" ON audit_log
  FOR INSERT WITH CHECK (true);
-- No SELECT policy = no reads via anon or auth key
```

### 8.2 Column-Level Grants (Defence Against Accidental Exposure)

```sql
-- Explicitly revoke phone from anon key access on properties
-- (belt-and-suspenders on top of the fact we removed it from the public API schema)

-- Create a restricted view for the anon key
CREATE VIEW public_properties AS
  SELECT
    id, title, description, type, property_category,
    price, price_unit, city, locality,
    area, area_unit, bedrooms, bathrooms,
    furnishing, amenities, photos_json,
    rera_number, rera_verified_at,
    featured, is_premium, premium_until,
    status, created_at, updated_at
    -- owner_id, owner_phone intentionally ABSENT
  FROM properties
  WHERE status = 'active';

GRANT SELECT ON public_properties TO anon;
REVOKE ALL ON properties FROM anon;
```

### 8.3 Field-Level Encryption for PAN/Aadhaar

```typescript
// artifacts/api-server/src/lib/fieldEncryption.ts

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits

/**
 * Derives the Data Encryption Key from environment.
 * In production: use a KMS-managed key (AWS KMS, HashiCorp Vault, etc.)
 * For now: strong env var, rotated quarterly.
 */
function getDek(): Buffer {
  const keyHex = process.env.FIELD_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("FIELD_ENCRYPTION_KEY must be 64 hex chars (32 bytes)");
  }
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypts a plaintext string.
 * Returns: base64(IV[12] || AuthTag[16] || Ciphertext)
 */
export function encryptField(plaintext: string): string {
  const iv = randomBytes(12);           // 96-bit IV for GCM
  const key = getDek();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * Decrypts a ciphertext produced by encryptField.
 */
export function decryptField(ciphertext: string): string {
  const buf = Buffer.from(ciphertext, "base64");
  
  const iv      = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const data    = buf.subarray(28);
  
  const key = getDek();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]).toString("utf8");
}

// ── Usage in KYC route ─────────────────────────────────────────────────────
// Before INSERT:
//   panNumberEnc: encryptField(body.panNumber),
//   aadhaarNumberEnc: encryptField(body.aadhaarNumber),
//   aadhaarLast4: body.aadhaarNumber.slice(-4),  // for display
//   panFirst5: body.panNumber.slice(0, 5),         // for display
//
// Before returning to authorised caller (admin KYC review):
//   panNumber: decryptField(kyc.panNumberEnc),
//   aadhaarNumber: decryptField(kyc.aadhaarNumberEnc),
//
// Never decrypt and return to any non-admin caller.
```

---

## 9. Frontend Security Architecture

### 9.1 What the Frontend Must Never Do

| Never | Why | Alternative |
|-------|-----|------------|
| Store auth tokens in `localStorage` | Accessible to any JS on the page (XSS) | Clerk manages session cookies; use Clerk's SDK |
| Store PAN / Aadhaar in component state beyond the form | Memory leak, DevTools exposure | Submit immediately; don't persist |
| Import `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | This key bypasses all RLS — it's a God key | Only the API server uses service_role |
| Pass `ownerPhone` in URL params or query strings | Logged by servers, cached by browsers | POST body only; never in URL |
| Use `dangerouslySetInnerHTML` with user-provided text | Direct XSS | DOMPurify or safe rendering |
| Bundle secret API keys | Vite bundles everything in `import.meta.env.*` | Server-side only for secrets |

### 9.2 Vite / React Environment Variable Rules

```
# .env.example — annotated with security classification

# PUBLIC (safe to bundle — Clerk publishable key is designed to be public)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# PUBLIC (safe — Supabase anon key is designed to be public; RLS enforces limits)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# PUBLIC (safe — just a URL)
VITE_API_BASE_URL=https://api.propunified.in

# NEVER in .env.example or frontend .env:
# CLERK_SECRET_KEY            → API server only
# SUPABASE_SERVICE_ROLE_KEY   → API server only
# FIELD_ENCRYPTION_KEY        → API server only
# DATABASE_URL                → API server only
# RAZORPAY_KEY_SECRET         → API server only
```

### 9.3 Content Security Policy for the SPA

Add to `index.html` or via a meta tag (HTTP header is stronger — set in Vercel headers config):

```html
<!-- artifacts/prop-unified/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://clerk.propunified.in https://*.clerk.accounts.dev;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://your-cdn.com https://*.supabase.co blob:;
  connect-src 'self'
    https://api.propunified.in
    https://clerk.propunified.in
    https://*.clerk.accounts.dev
    https://*.supabase.co
    https://maps.googleapis.com;
  frame-src https://checkout.razorpay.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
">
```

```json
// vercel.json — set as HTTP response headers (stronger than meta tag)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(self), camera=(), microphone=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://clerk.propunified.in; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://your-cdn.com blob:; connect-src 'self' https://api.propunified.in https://*.clerk.accounts.dev https://*.supabase.co; frame-src https://checkout.razorpay.com; object-src 'none'; base-uri 'self'; upgrade-insecure-requests"
        }
      ]
    }
  ]
}
```

---

## 10. Infrastructure Security Architecture

### 10.1 Cloudflare Configuration

Cloudflare sits between the internet and both Vercel (frontend) and Render (API). Every request passes through it.

```
Internet → Cloudflare → Vercel (frontend) / Render (API)
```

**Cloudflare WAF Rules — configure these:**

| Rule | Expression | Action |
|------|-----------|--------|
| Block Tor exit nodes | `ip.geoip.is_in_european_union = false AND ip.src in $tor_exit_nodes` | Block |
| Block known scraper UAs | `http.user_agent contains "scrapy" or contains "python-requests"` | Challenge |
| Rate limit auth endpoints | `/api/auth/*` > 10/min/IP | Challenge |
| Rate limit contact reveal | `/api/properties/*/contact` > 5/min/IP | Challenge |
| Block SQL injection patterns | `http.request.uri contains "' OR 1=1"` | Block |
| Challenge high-volume search | `/api/properties` > 200/min/IP | JS Challenge |
| Admin panel origin protection | Host = `admin.propunified.in` AND not via Zero Trust | Block |

**Cloudflare Zero Trust for Admin:**
- Admin panel only accessible after Cloudflare Access authentication
- Require: company email domain + FIDO2 hardware key
- Session duration: 8 hours, re-authenticate for any destructive action

### 10.2 Render API Server Hardening

```yaml
# render.yaml (infrastructure as code)
services:
  - type: web
    name: propunified-api
    runtime: node
    buildCommand: npm run build
    startCommand: node dist/index.js
    
    # Private networking — API not directly internet-accessible except via Cloudflare
    # Use Render's private network for DB connections
    
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: propunified-db
          property: connectionString
      - key: CLERK_SECRET_KEY
        sync: false      # manually set — never in code
      - key: FIELD_ENCRYPTION_KEY
        sync: false      # manually set — rotate quarterly
      - key: RAZORPAY_WEBHOOK_SECRET
        sync: false
      
    healthCheckPath: /api/healthz
    autoDeploy: true
    
    # Restrict incoming traffic to Cloudflare IP ranges
    # Configure at Render level: only accept connections from Cloudflare
```

### 10.3 Secrets Management

```
Secret                          Location              Rotation
─────────────────────────────────────────────────────────────
CLERK_SECRET_KEY                Render env var        On compromise or quarterly
SUPABASE_SERVICE_ROLE_KEY       Render env var        On compromise or quarterly
FIELD_ENCRYPTION_KEY            Render env var        Quarterly (requires re-encrypt)
DATABASE_URL                    Render env var        On compromise
RAZORPAY_KEY_SECRET             Render env var        On compromise
RAZORPAY_WEBHOOK_SECRET         Render env var        On compromise
CERT-IN_NOTIFICATION_EMAIL      Config (not secret)   N/A

Rules:
- Zero secrets in .env files committed to git
- Zero secrets in NEXT_PUBLIC_* / VITE_* variables
- Render and Vercel dashboards are the secret stores
- Rotate all secrets immediately on any suspected exposure
- Pre-commit hook (Trufflehog or git-secrets) blocks accidental commits of secrets
```

---

## 11. KYC & Sensitive Data Architecture

### 11.1 KYC Flow with Security Controls

```
User submits KYC form (PAN + Aadhaar)
           │
           ▼
[Frontend] — Fields collected in React state, NEVER stored locally
           │ HTTPS POST to API
           ▼
[API Server] 
  1. requireAuth — must be authenticated
  2. kycSubmitLimiter — max 3/hour per user
  3. Zod validation of PAN format (AAAAA9999A) and Aadhaar (12 digits)
  4. encryptField(panNumber) → panNumberEnc
  5. encryptField(aadhaarNumber) → aadhaarNumberEnc
  6. Store last4 of Aadhaar and first5 of PAN for display purposes
  7. Set status = "pending"
  8. Emit audit event: kyc_submitted
           │
           ▼
[Database] — stores only encrypted values
           │
           ▼
[Admin Review Flow]
  1. Admin authenticates via Zero Trust + MFA
  2. Fetches KYC record: decryptField(aadhaarNumberEnc) only in admin session
  3. Approves/rejects — updates status field
  4. Emit audit event: kyc_reviewed with reviewerId
  5. Update users.kycStatus → "approved" or "rejected"
           │
           ▼
[Notification] — SMS/email to user with outcome (no KYC data in notification)
```

### 11.2 KYC Data Access Rules

```
Endpoint                    Who can call              What is returned
────────────────────────────────────────────────────────────────────
GET /api/kyc                Owner (self)              All fields EXCEPT panNumberEnc, 
                                                       aadhaarNumberEnc; returns
                                                       panFirst5 + "XXXXX", 
                                                       "XXXXXXXX" + aadhaarLast4

GET /admin/kyc/:id          Admin + MFA verified      All fields, decrypted on request

POST /api/kyc               Owner (self)              Accepts plaintext, stores encrypted

PATCH /admin/kyc/:id        Admin only                status, notes, reviewedBy
```

### 11.3 Document Storage (KYC Uploads)

```typescript
// File upload flow for KYC documents (PAN card photo, Aadhaar card photo)

// Step 1: Client requests a pre-signed upload URL from API
// POST /api/kyc/upload-url
// Returns: { uploadUrl: "s3://...", key: "kyc/{userId}/{uuid}.jpg" }

// Step 2: Client uploads directly to S3/Supabase Storage using pre-signed URL
// (file never passes through your API server — reduces attack surface)

// Step 3: API server records the S3 key (not the URL) in the KYC record

// Access pattern for admin review:
// Admin requests GET /admin/kyc/:id/documents
// API generates a short-lived (15-minute) signed download URL
// Admin's browser fetches document directly from storage with signed URL

// Security controls on storage bucket:
// - No public access policy
// - Enforce object encryption (SSE-KMS)
// - Bucket access log enabled
// - Lifecycle rule: delete objects after 7 years (PMLA retention)
// - Virus scan on upload using ClamAV Lambda trigger (or Supabase equivalent)
```

---

## 12. Payment Security Architecture

### 12.1 Razorpay Integration Pattern (SAQ A compliant)

```typescript
// artifacts/api-server/src/routes/payments.ts

import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth } from "../middlewares/authenticate";
import { auditLog } from "../lib/auditLog";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,  // NEVER in client code
});

const router = Router();

// Step 1: Create order server-side (price is set here, never from client)
router.post("/orders", requireAuth, async (req, res) => {
  const { planType } = req.body;  // e.g., "premium_listing_30d"
  
  // Server-side price lookup — NEVER trust price from client
  const PLAN_PRICES: Record<string, number> = {
    premium_listing_30d: 99900,   // ₹999 in paise
    premium_listing_90d: 249900,  // ₹2499 in paise
  };
  
  const amount = PLAN_PRICES[planType];
  if (!amount) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `order_${req.authContext!.clerkUserId}_${Date.now()}`,
    notes: { userId: req.authContext!.clerkUserId, planType },
  });
  
  await auditLog({
    eventType: "payment_order_created",
    actorId: req.authContext!.clerkUserId,
    metadata: { orderId: order.id, amount, planType },
  });
  
  // Return order ID to client — NOT the secret key
  res.json({ orderId: order.id, amount, currency: "INR" });
});

// Step 2: Verify payment after Razorpay callback
router.post("/verify", requireAuth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  // Cryptographic verification — NEVER skip this
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))) {
    await auditLog({
      eventType: "payment_signature_mismatch",
      actorId: req.authContext!.clerkUserId,
      metadata: { orderId: razorpay_order_id },
    });
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }
  
  // Cross-verify with Razorpay API (don't trust client-reported payment ID)
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  if (payment.status !== "captured" || payment.order_id !== razorpay_order_id) {
    res.status(400).json({ error: "Payment not captured" });
    return;
  }
  
  // Now fulfil the order (update listing to premium, etc.)
  // ... business logic here ...
  
  await auditLog({
    eventType: "payment_verified",
    actorId: req.authContext!.clerkUserId,
    metadata: { paymentId: razorpay_payment_id, orderId: razorpay_order_id },
  });
  
  res.json({ success: true });
});

// Step 3: Webhook (server-to-server, not user-initiated)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const body = req.body.toString();
  
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    res.status(400).send("Invalid signature");
    return;
  }
  
  const event = JSON.parse(body);
  // Handle payment.captured, subscription.charged, etc.
  res.json({ received: true });
});
```

---

## 13. Audit, Observability & Incident Response Architecture

### 13.1 Audit Log Schema

```typescript
// lib/db/src/schema/auditLog.ts

export const auditLogTable = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Who
  actorId: text("actor_id"),                    // Clerk userId (null for system events)
  actorRole: text("actor_role"),
  actorIpHash: text("actor_ip_hash"),           // SHA-256(IP) — privacy-preserving
  actorUserAgent: text("actor_user_agent"),
  
  // What
  eventType: text("event_type").notNull(),      // contact_reveal, kyc_submitted, payment_verified, etc.
  resourceType: text("resource_type"),           // property, listing, inquiry, user, kyc
  resourceId: text("resource_id"),               // UUID of the affected resource
  targetUserId: text("target_user_id"),          // owner of the resource (if different from actor)
  
  // Context
  requestId: text("request_id"),                // correlates to HTTP log
  sessionId: text("session_id"),                // Clerk session ID
  metadata: text("metadata"),                   // JSON — event-specific details
  
  // Outcome
  outcome: text("outcome").notNull().default("success"),  // success | failure | error
  
  // Immutable timestamp
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  
  // No updatedAt — audit records are immutable
});

// Audit log is INSERT-only at the application level.
// No UPDATE or DELETE granted to application DB user.
// Separate retention job (runs as different DB role) handles archival.
```

### 13.2 Audit Log Service

```typescript
// artifacts/api-server/src/lib/auditLog.ts

interface AuditEvent {
  eventType: string;
  actorId?: string;
  actorRole?: string;
  resourceType?: string;
  resourceId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
  outcome?: "success" | "failure" | "error";
  requestId?: string;
  sessionId?: string;
  ipHash?: string;
}

/**
 * Write an audit event. 
 * Async, non-blocking — uses void to not block request handler.
 * If audit write fails, we log the error but do NOT fail the request.
 * (Audit failure is not a reason to block a legitimate user action,
 *  but it IS alerted to ops team via SIEM.)
 */
export function auditLog(event: AuditEvent): void {
  db.insert(auditLogTable).values({
    ...event,
    metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    occurredAt: new Date(),
  }).catch((err) => {
    logger.error({ err, event }, "AUDIT_LOG_WRITE_FAILURE — ALERT OPS");
    // In production: also push to dead-letter queue for recovery
  });
}
```

### 13.3 Events to Always Audit

| Event | Trigger | Data Recorded |
|-------|---------|---------------|
| `user_login` | Clerk webhook | actorId, sessionId, ipHash |
| `user_logout` | Clerk webhook | actorId, sessionId |
| `contact_reveal` | POST /properties/:id/contact | actorId, propertyId, targetOwnerId, ipHash |
| `kyc_submitted` | POST /kyc | actorId |
| `kyc_status_changed` | Admin action | actorId (admin), targetUserId, old/new status |
| `listing_created` | POST /listings | actorId, listingId |
| `listing_status_changed` | PATCH /listings/:id | actorId, listingId, old/new status |
| `property_deleted` | DELETE /properties/:id | actorId, propertyId |
| `payment_order_created` | POST /payments/orders | actorId, amount, planType |
| `payment_verified` | POST /payments/verify | actorId, paymentId, orderId |
| `payment_signature_mismatch` | POST /payments/verify | actorId, orderId — HIGH ALERT |
| `auth_failed` | requireAuth middleware | ipHash, userAgent — for brute force detection |
| `authz_denied` | requireRole / ownership check | actorId, resource, action |
| `admin_action` | Any /admin/* endpoint | actorId, action, resourceId |
| `data_export` | GET /users/me/export | actorId (DPDP right to access) |
| `account_deleted` | DELETE /users/me | actorId (DPDP right to erasure) |

---

## 14. Secure Development Lifecycle

### 14.1 The Security Gate at Every PR

No PR merges to `main` without passing:

```yaml
# .github/workflows/security.yml

name: Security Gates

on: [pull_request]

jobs:
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          # Fails CI if any secret pattern detected

  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/nodejs
            p/typescript
            p/express
            p/owasp-top-ten
        # Fails CI on HIGH findings; warns on MEDIUM

  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=high
        # Fails CI if any HIGH or CRITICAL CVE in dependencies

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run typecheck
        # Type safety = fewer injection surfaces
```

### 14.2 Pre-Commit Hooks

```json
// package.json (root)
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{ts,tsx,js}": "semgrep --config=p/security-audit --quiet"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run typecheck",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### 14.3 Dependency Management Rules

```
# .npmrc
engine-strict=true           # fail if Node version doesn't match engines field
save-exact=true              # pin exact versions, not ranges — no surprise updates
audit=true                   # run audit on every install

# package.json lockfile approach:
# - Commit package-lock.json to git
# - CI uses `npm ci` (not `npm install`) — exact lockfile
# - Renovate bot opens PRs for dependency updates (reviewed, not auto-merged)
# - Dependabot alerts enabled for security advisories
```

### 14.4 Branch and Deployment Protection

```
Branch rules for `main`:
  ✓ Require PR review (1 approver minimum)
  ✓ Require status checks: security.yml, typecheck, tests
  ✓ Require signed commits (GPG)
  ✓ No force-push
  ✓ No direct push (all changes via PR)

Deployment gates:
  Staging deploy: automatic on merge to `main`
  Production deploy: requires manual approval in GitHub Actions
  Rollback: one-click via Vercel/Render UI (keep last 5 deployments)
```

---

## 15. Compliance Mapping to Architecture

| Compliance Requirement | Architecture Control | Implementation |
|----------------------|---------------------|----------------|
| DPDP Rule 6.1 — Encryption at rest | AES-256 for PAN/Aadhaar; Postgres at-rest encryption | `fieldEncryption.ts`; Supabase SSE |
| DPDP Rule 6.2 — Access controls | RBAC + Ownership checks + RLS | `authenticate.ts`, `authorise.ts`, Postgres RLS |
| DPDP Rule 6.3 — Data masking | ownerPhone not in API response; logs masked | `public_properties` view; log serialiser |
| DPDP Rule 6.4 — Access monitoring | Audit log for every PII access | `auditLog.ts`; `contact_reveal` event |
| DPDP Rule 6.5 — Log retention 1yr | Immutable S3 log store | S3 lifecycle policy: 365 days |
| DPDP Rule 6.6 — Incident response | Breach playbook + alert pipeline | SIEM alerts; runbook in SECURITY_COMPLIANCE.md |
| DPDP Rule 6.7 — Backup & BC | Daily backups, tested restores | Supabase PITR; tested monthly |
| DPDP Rule 7 — Breach notification | SIEM → PagerDuty → 6hr/72hr clock | Alert pipeline; pre-written templates |
| DPDP Rule 8 — Erasure | Account deletion soft-deletes then hard-deletes after 48h | `DELETE /users/me` endpoint + scheduled job |
| CERT-In — 6hr breach report | SIEM alert → on-call → CERT-In | Documented in IR playbook |
| CERT-In — 180-day log retention | Audit logs in India-region S3 | ap-south-1 bucket; 365-day retention (meets both) |
| GujRERA — RERA number display | `reraNumber` column in DB; validation on listing create | Schema + route validation |
| PCI DSS SAQ A — hosted checkout | Razorpay redirect only | `payments.ts` — never card fields in DOM |
| PCI DSS 6.4.3 — Script inventory | CSP + SRI on payment-adjacent pages | `vercel.json` CSP headers |
| OWASP API1 — BOLA | Ownership checks on all resource endpoints | `ownership.ts` middleware |
| OWASP API2 — Broken Auth | Clerk JWT; server-side role lookup | `authenticate.ts` |
| OWASP API4 — Resource consumption | Per-endpoint rate limiters | `rateLimiter.ts` |
| OWASP API5 — BFLA | requireRole on all write operations | `authorise.ts` |
| OWASP API7 — SSRF | No server-side URL fetching from user input | File upload via pre-signed URLs |
| IT Rules 2026 — 3hr takedown | Automated content disable capability + on-call | Admin panel + Cloudflare rule |
| Consumer Protection — Grievance | Grievance endpoint + email routing | `POST /api/grievances` |
| Aadhaar Act — No plaintext storage | Field-level encryption | `fieldEncryption.ts` |

---

## 16. Implementation Roadmap

### Sprint 0 — Stop the Bleeding (Week 1)

These are fixes to the live POC. Nothing else before these are done.

**Day 1:**
- [ ] Fix CORS: change `origin: true` to explicit `ALLOWED_ORIGINS` array
- [ ] Add `requireAuth` to all write endpoints (POST/PATCH/DELETE on properties, listings)
- [ ] Add `requireListingOwnership` to GET/PATCH/DELETE `/listings/:id`
- [ ] Scope `GET /listings` to `sellerId = req.authContext.userId`
- [ ] Remove `role` from `UserUpdate` schema and route

**Day 2:**
- [ ] Remove `ownerPhone` from `GET /properties` response projection
- [ ] Create `POST /properties/:id/contact` endpoint with auth + rate limit
- [ ] Add global error handler (no stack traces to clients)
- [ ] Add request size limits
- [ ] Add helmet (security headers)

**Day 3:**
- [ ] Migrate schema: UUIDs for all IDs
- [ ] Add `reraNumber` column to properties
- [ ] Remove `ownerName`, `ownerPhone` columns from properties (store in users table)
- [ ] Fix `isPremium` — gate behind payment verification, not free flag in body

**Day 4:**
- [ ] Field encryption for `panNumber`, `aadhaarNumber` in KYC
- [ ] Enable Supabase RLS on users, kyc, listings, properties, inquiries tables
- [ ] Write and test all RLS policies from Section 8.1

**Day 5:**
- [ ] Add audit log table and `auditLog()` service
- [ ] Instrument: login, contact_reveal, kyc_submitted, payment events
- [ ] Deploy and smoke-test all changes on staging

---

### Sprint 1 — Security Foundation (Weeks 2–4)

- [ ] Rate limiting on every endpoint (per-endpoint limiters from Section 7.2)
- [ ] Input sanitisation — DOMPurify on description fields before insert
- [ ] File upload hardening (magic-byte validation, AV scan, UUID rename, S3 pre-signed URLs)
- [ ] CI security gates: Trufflehog + Semgrep + npm audit in GitHub Actions
- [ ] Pre-commit hooks: secrets scan, lint, typecheck
- [ ] Cloudflare WAF rules configured (Section 10.1)
- [ ] Security headers in `vercel.json` (Section 9.3)
- [ ] Admin panel separated behind Cloudflare Zero Trust + MFA
- [ ] Incident response runbook written and tested (tabletop)

---

### Sprint 2 — Privacy Engineering (Weeks 5–8)

- [ ] Consent management UI (EN/HI/GU) + consent records table
- [ ] Self-service: download my data (`GET /users/me/export`)
- [ ] Self-service: delete my account (`DELETE /users/me`) with 48h soft-delete
- [ ] Data retention jobs: automated deletion of inactive accounts (3yr rule)
- [ ] DLT registration for SMS sender IDs and templates
- [ ] WhatsApp Business API opt-in capture
- [ ] Privacy Policy and Terms of Service published on platform
- [ ] Grievance Officer contact published; `POST /api/grievances` endpoint live
- [ ] DPDP consent notice drafted with legal counsel

---

### Sprint 3 — Hardening & Compliance (Weeks 9–16)

- [ ] ISO 27001:2022 gap assessment (engage consultant)
- [ ] Annual penetration test booked (CERT-In empanelled firm)
- [ ] Proxy phone number masking for property contacts (Exotel integration)
- [ ] RERA number verification API integration (GujRERA lookup on listing create)
- [ ] QR code generation for each listing (GujRERA mandate)
- [ ] SOC 2 readiness assessment
- [ ] Staff security training programme launched
- [ ] Quarterly tabletop exercise
- [ ] SIEM deployed with alert rules from Section 13

---

### Phase 2+ — Continuous

- [ ] Annual penetration test + remediation (within 7 days for Critical/High)
- [ ] Quarterly access review (who has admin/elevated access?)
- [ ] Monthly security metrics review
- [ ] DPDP full compliance by 13 May 2027
- [ ] ISO 27001 certification
- [ ] Bug bounty programme launched

---

*This document is a living reference. Update it when the architecture changes, when new frameworks are added, or when threat model changes. Every significant security decision should be captured here.*

*Version history: track in git — the diff IS the changelog.*
