# DEVELOPER SECURITY CHECKLIST

**Project:** Prop Unified  
**Owner:** Security Champion / Engineering Lead  
**Version:** 1.0 — June 2026  
**Use:** Before every PR merge. Before every new feature. Print and keep at desk.

---

> This is your daily-use security reference. The SECURITY_ARCHITECTURE.md has the deep explanation of every item here. This document gives you the checklist — scan it before you merge.

---

## Part 1 — Pre-PR Checklist (Every PR, Every Time)

Run through this before opening any pull request.

### Secrets & Credentials
- [ ] No secrets, API keys, passwords, or tokens in the code diff
- [ ] No secrets in test fixtures, seed files, or mock data
- [ ] No secrets in comments or docstrings
- [ ] Any new environment variables are documented in `.env.example` (name only, not value)
- [ ] New env vars intended to be server-side are **not** prefixed `VITE_` or `NEXT_PUBLIC_`
- [ ] `npm audit` passes — no HIGH or CRITICAL CVEs in dependency changes

### Authentication
- [ ] Every new route that handles user data has `requireAuth` middleware
- [ ] Auth comes from `req.authContext` (set by `authenticate.ts`) — never from `(req as any).auth?.userId`
- [ ] No route trusts a user-supplied `userId` in the request body or query string for identifying the acting user

### Authorisation
- [ ] Every write endpoint (POST, PATCH, PUT, DELETE) has an explicit role check (`requireRole`)
- [ ] Every endpoint that reads or modifies a resource owned by a user has an ownership check (`requireListingOwnership`, `requirePropertyOwnership`, etc.)
- [ ] Admin-only endpoints use `requireRole("admin")` — not just `requireAuth`
- [ ] Role changes are not possible through user-facing endpoints (PATCH /users/me does not accept `role`)

### Input Validation
- [ ] Every request body is validated against a Zod schema
- [ ] Schemas use strict mode or `.strip()` — unknown fields are not passed through to the DB
- [ ] String fields have a `max()` length constraint
- [ ] Numeric fields have `min()` / `max()` range constraints
- [ ] Enum fields only accept documented values
- [ ] Free-text fields (descriptions, titles) are sanitised with `stripHtml()` or `sanitiseRichText()` before storage

### Database
- [ ] All DB queries go through Drizzle ORM — no raw SQL string concatenation with user input
- [ ] New tables have a UUID primary key (not serial integer for external-facing IDs)
- [ ] New tables with PII have corresponding RLS policies written and tested
- [ ] Queries that retrieve records for the current user are scoped to `req.authContext.clerkUserId`
- [ ] No query returns more rows than the caller needs (apply `limit()` and pagination)

### Output / Response
- [ ] API responses do not include `ownerPhone`, `panNumber`, `aadhaarNumber`, or any field marked as Restricted
- [ ] Error responses never include stack traces, DB error messages, or internal paths
- [ ] User-generated content is HTML-encoded on output if rendered in a browser context

### Audit Logging
- [ ] Sensitive actions have a corresponding `auditLog()` call: contact reveal, KYC actions, payment events, admin actions, account deletion
- [ ] Audit log calls use `void auditLog(...)` — they must not block the response

### Rate Limiting
- [ ] New auth endpoints use `authLimiter`
- [ ] New contact-reveal type endpoints use `contactRevealLimiter`
- [ ] New write endpoints use `writeActionLimiter`
- [ ] New public-read endpoints use `publicSearchLimiter`
- [ ] If an endpoint has no rate limiter, document why in the PR description

---

## Part 2 — New API Endpoint Checklist

Use this when you add any new route to the API server.

```
Endpoint: ___________________________
Method:   ___________________________
Auth required: Yes / No (justify if No)
```

- [ ] **Is this endpoint public?**
  - If yes: does it expose any PII? If so, it should not be public — add auth
  - If yes: does it accept writes? If so, it should not be public — add auth
  
- [ ] **Authentication:** `requireAuth` added?

- [ ] **Authorisation:**
  - Role check: which roles are allowed to call this?
  - Ownership check: if it reads/modifies a specific resource, is ownership verified?

- [ ] **Input validation:**
  - Zod schema created for request body?
  - Query params validated with Zod?
  - Path params are of expected type (e.g., UUID format check)?

- [ ] **Rate limiting:**
  - Which rate limiter is applied?
  - Is the limit appropriate for this endpoint's risk level?

- [ ] **Output:**
  - What does the response contain?
  - Does it include any PII that the caller might not need?
  - Is there a public projection (no sensitive fields) and a private projection (with sensitive fields, higher auth)?

- [ ] **Error handling:**
  - Are all error paths handled?
  - Do errors return generic messages (not DB errors, not stack traces)?
  - Does a "not found" return 404 consistently (not 403 — that confirms existence)?

- [ ] **Audit logging:**
  - Should this action be audited?
  - If yes: `auditLog()` call added with correct eventType and metadata?

- [ ] **OpenAPI spec:**
  - New endpoint added to `lib/api-spec/openapi.yaml`?
  - Response schema does not include sensitive fields that shouldn't be returned?

---

## Part 3 — New Database Table Checklist

Use this when you add any new table to the schema.

```
Table name: ___________________________
Contains PII: Yes / No
Contains SPDI (PAN, Aadhaar, financial): Yes / No
```

- [ ] **Primary key:** UUID (`uuid("id").primaryKey().defaultRandom()`)
  - Exception: internal junction tables can use serial, but must not expose the ID in APIs

- [ ] **Timestamps:** `createdAt` and `updatedAt` columns present

- [ ] **PII annotation:** PII columns identified in a code comment for the RoPA / erasure job

- [ ] **SPDI fields:** any PAN, Aadhaar, bank account, card data → field-level encryption required (`encryptField()`)

- [ ] **Row Level Security:** RLS policy written before first INSERT
  - Who can read this table (own rows, any rows, no one via anon key)?
  - Who can write?
  - Is the anon key intentionally blocked?

- [ ] **Indexes:** appropriate indexes for all WHERE-clause columns

- [ ] **Foreign keys:** referenced correctly; ON DELETE behaviour documented

- [ ] **Retention policy:** what is the retention period? Is it in DATA_FLOW_REGISTER.md?

- [ ] **Erasure job:** if this table holds user-linked PII, is the erasure job updated to null/delete this table's rows when a user account is deleted?

---

## Part 4 — New Third-Party Integration Checklist

Use this when you add any new external service, SDK, or API.

```
Service name: ___________________________
What data does it receive: ___________________________
```

- [ ] **Vendor security review:**
  - Does the vendor have ISO 27001 or SOC 2 certification?
  - Do they have an India data-residency option (or confirmed to not store Indian user data outside India)?
  - Have they had a known breach in the last 2 years?

- [ ] **Data Processing Agreement:**
  - DPA signed before any user data is sent to this vendor?
  - DPA includes DPDP flow-down clauses (Rule 6 safeguards, breach notification)?

- [ ] **Minimum data sharing:**
  - Does the integration send only the data the vendor needs?
  - No PAN/Aadhaar/payment data sent unless absolutely required (and then with explicit legal justification)?

- [ ] **API key management:**
  - Vendor API key stored in Render/Vercel env vars (not in code)?
  - Vendor API key NOT prefixed `VITE_` or `NEXT_PUBLIC_`?
  - Key scope limited (read-only where possible)?

- [ ] **Webhook security:**
  - Incoming webhooks verified by HMAC signature before processing?
  - Webhook endpoint not guessable (random path or token in URL)?

- [ ] **Failure handling:**
  - If this vendor goes down, what fails? Is that acceptable?
  - Is the failure graceful (fallback, not crash)?

- [ ] **RoPA update:**
  - New processing activity added to DATA_FLOW_REGISTER.md?

---

## Part 5 — File Upload / Media Checklist

Use this for any feature that accepts file uploads from users.

- [ ] File MIME type validated by **magic bytes** (not file extension — extensions are trivially faked)
- [ ] Maximum file size enforced server-side (not just client-side)
- [ ] Uploaded file renamed to a random UUID before storage (prevent path traversal; no original filename stored as path)
- [ ] Files stored in S3/Supabase Storage bucket — not served from application server
- [ ] Storage bucket has no public access policy — files only accessible via signed URLs
- [ ] Signed URLs are short-lived (15–60 minutes maximum)
- [ ] EXIF metadata stripped from images (location data in photos is a privacy leak)
- [ ] Virus scanning configured for uploads (ClamAV or cloud AV)
- [ ] If accepting documents (PDF, DOC): PDF parsing does not execute macros or JavaScript

---

## Part 6 — Frontend / React Checklist

Use this for frontend component changes.

- [ ] No sensitive data (auth tokens, PAN, Aadhaar, phone numbers) stored in `localStorage` or `sessionStorage`
  - Auth tokens: Clerk SDK manages these — don't touch them
  - Sensitive form inputs: clear state after submission, don't persist

- [ ] No `dangerouslySetInnerHTML` with user-provided or API-sourced text
  - If rich text rendering is needed: DOMPurify sanitise before passing to `dangerouslySetInnerHTML`

- [ ] No secrets in `import.meta.env.*` or `process.env.*` variables that are exposed to the browser bundle
  - Only `VITE_*` vars are bundled — check every `import.meta.env` reference

- [ ] `ownerPhone` is not rendered directly from a listing API response
  - Contact reveal requires a separate button that calls `POST /properties/:id/contact`

- [ ] API calls use the typed API client from `lib/api-client-react` — not raw `fetch` with hand-crafted URLs

- [ ] Payment UI: if showing a Razorpay checkout, it uses their redirect/iframe — no card input fields built in React

---

## Part 7 — Payment Feature Checklist

Use this for any change to the payment flow.

- [ ] Product price is determined **server-side** from a hardcoded price map — never from the request body
- [ ] Razorpay Order is created server-side (never client-side)
- [ ] Only the `orderId` is returned to the client — not the `key_secret`
- [ ] After payment, the client sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to a verify endpoint
- [ ] Verify endpoint: HMAC signature check using `timingSafeEqual` (not `===`)
- [ ] Verify endpoint: cross-checks payment status with Razorpay API (does not trust client assertion)
- [ ] Webhook handler: signature verified before processing
- [ ] Idempotency keys used on order creation
- [ ] No raw card data ever touches any Prop Unified server or log

---

## Part 8 — Quick Reference: Security Patterns

### The BOLA fix pattern

```typescript
// Every route that reads/modifies a specific resource:
router.patch("/:id", requireAuth, requireResourceOwnership, async (req, res) => {
  // At this point, we KNOW req.authContext.clerkUserId owns req.params.id
  // Proceed with business logic
});
```

### The safe response projection pattern

```typescript
// Never return full DB row to client — project only what they need
function toPublicProperty(row: typeof propertiesTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    city: row.city,
    // ownerPhone, ownerId intentionally ABSENT
  };
}
```

### The safe error handler pattern

```typescript
try {
  // business logic
} catch (err) {
  req.log.error({ err }, "descriptive message for internal logs");
  res.status(500).json({ error: "Internal server error" }); // no err.message to client
}
```

### The audit log pattern

```typescript
// Non-blocking — never await, never let failure break the request
void auditLog({
  eventType: "contact_reveal",
  actorId: req.authContext!.clerkUserId,
  resourceType: "property",
  resourceId: propertyId,
});
```

### The field encryption pattern

```typescript
// On write (KYC submission):
panNumberEnc: encryptField(body.panNumber),
panFirst5: body.panNumber.slice(0, 5),  // for display only

// On read (admin only):
const pan = decryptField(kyc.panNumberEnc);

// On read (self / non-admin):
// Return panFirst5 + "XXXXX" — never decrypted value
```

### The Zod schema with strip pattern

```typescript
// Zod strips unknown fields by default in v3+
// Make it explicit:
const CreateListingBody = z.object({
  propertyId: z.string().uuid(),
  listingType: z.enum(["sale", "rent", "commercial", "plot", "pg"]),
  askingPrice: z.number().positive().max(999_999_999).optional(),
  description: z.string().max(5000).optional(),
  // isPremium intentionally ABSENT — cannot be set directly
}).strict(); // .strict() throws on unknown fields
```

---

*If you are unsure about any item on this checklist, ask the Security Champion or Engineering Lead before merging.*  
*Do not skip items because a PR seems small — every merge is a potential attack surface change.*
