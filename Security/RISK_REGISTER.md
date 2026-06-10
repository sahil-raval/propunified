# RISK REGISTER

**Project:** Prop Unified  
**Owner:** CISO / Security Lead  
**Version:** 1.0 — June 2026  
**Review Cadence:** Quarterly  
**Classification:** Internal — Confidential  

---

## How to Use This Register

**Scoring:** Likelihood × Impact on a 1–5 scale.  
**Risk Score:** Likelihood × Impact = 1–25.  
**Appetite:** Scores ≤ 6 are acceptable as residual risk. Scores 8–12 need monitoring. Scores ≥ 15 must be actively treated.

| Score | Level |
|-------|-------|
| 20–25 | CRITICAL — treat immediately |
| 15–19 | HIGH — treat within 30 days |
| 8–12 | MEDIUM — treat within 90 days |
| 4–6 | LOW — monitor |
| 1–3 | ACCEPTED — document and review annually |

**Treatment options:**
- **Mitigate** — implement controls to reduce likelihood or impact
- **Transfer** — buy insurance, use a third party who accepts the risk
- **Accept** — document and live with it (only acceptable for LOW risks)
- **Avoid** — change the business decision that creates the risk

---

## Risk Appetite Statement

Prop Unified has a **LOW tolerance** for:
- Any risk involving the exposure of Aadhaar or PAN numbers
- Any risk of regulatory non-compliance leading to fines > ₹1 crore
- Any risk resulting in loss of user trust or platform reputation collapse

Prop Unified has a **MEDIUM tolerance** for:
- Technology platform risks (outages, performance)
- Competitive market risks

---

## Risk Register

### Category 1: Data Protection & Privacy

---

**RISK-001**  
**Title:** DPDP non-compliance — penalties before full implementation  
**Description:** The platform fails to meet DPDP Act obligations by the 13 May 2027 deadline, resulting in Data Protection Board enforcement action.  
**Likelihood:** 3 (possible — deadline is achievable but requires active effort)  
**Impact:** 5 (critical — ₹250 crore per violation; reputational collapse)  
**Score:** 15 — HIGH  
**Treatment:** Mitigate  
**Controls in place:**
- SECURITY_COMPLIANCE.md maps all obligations
- Phase 1 roadmap targets legal/privacy foundations by Q4 2026
**Remaining actions:**
- [ ] Appoint DPO by Q3 2026
- [ ] Publish consent notice in EN/HI/GU by Q3 2026
- [ ] Self-service rights portal by Q4 2026
- [ ] Legal counsel engaged for applicability review
**Owner:** DPO / Legal Lead  
**Residual Score (after controls):** 6 (if roadmap completed)  
**Review Date:** September 2026

---

**RISK-002**  
**Title:** PAN/Aadhaar plaintext exposure in database  
**Description:** KYC table currently stores PAN and Aadhaar numbers as plaintext. A database compromise exposes identity documents of all users who submitted KYC.  
**Likelihood:** 4 (likely — currently no field encryption; Supabase access credentials are single point of failure)  
**Impact:** 5 (critical — Aadhaar Act violation; DPDP breach; mass identity theft)  
**Score:** 20 — CRITICAL  
**Treatment:** Mitigate  
**Controls in place:** None (this is the POC state)  
**Remaining actions:**
- [ ] Implement `fieldEncryption.ts` (AES-256-GCM) — Sprint 0, Day 4
- [ ] Migrate existing records to encrypted form
- [ ] Enable Supabase RLS on KYC table — Sprint 0, Day 4
- [ ] Move `service_role` key to server-side only
**Owner:** Engineering Lead  
**Residual Score (after controls):** 4  
**Review Date:** July 2026 (Sprint 0 completion)

---

**RISK-003**  
**Title:** Contact/PII data scraping at scale  
**Description:** Automated bots systematically call `GET /api/properties` to harvest all owner phone numbers. Currently the `ownerPhone` field is returned in every property API response with no auth required.  
**Likelihood:** 5 (almost certain — this is the current state and the API is publicly accessible)  
**Impact:** 4 (high — DPDP breach; commercial loss; competitive damage)  
**Score:** 20 — CRITICAL  
**Treatment:** Mitigate  
**Controls in place:** None (Sprint 0 fix pending)  
**Remaining actions:**
- [ ] Remove `ownerPhone` from `GET /properties` response — Sprint 0, Day 2
- [ ] Create gated `POST /properties/:id/contact` endpoint
- [ ] Add contact reveal rate limit (10/hour per user)
- [ ] Add full audit log for every contact reveal
- [ ] Cloudflare bot management enabled
**Owner:** Engineering Lead  
**Residual Score (after controls):** 6  
**Review Date:** July 2026

---

**RISK-004**  
**Title:** Data breach notification clock failure  
**Description:** A breach occurs and the team cannot meet the CERT-In 6-hour or DPDP 72-hour notification deadlines due to lack of playbook, tooling, or team awareness.  
**Likelihood:** 4 (likely — no tested playbook currently exists)  
**Impact:** 4 (high — criminal liability; additional regulatory action for failure to notify)  
**Score:** 16 — HIGH  
**Treatment:** Mitigate  
**Controls in place:**
- INCIDENT_RESPONSE_RUNBOOK.md written (this document)
- Pre-written notification templates available
**Remaining actions:**
- [ ] Tabletop exercise to test 6-hour clock — Q3 2026
- [ ] SIEM → PagerDuty alert pipeline deployed
- [ ] On-call rota established
- [ ] Pre-written templates reviewed by legal counsel
**Owner:** Incident Commander / CISO  
**Residual Score (after controls):** 4  
**Review Date:** September 2026

---

### Category 2: Application Security

---

**RISK-005**  
**Title:** Broken Object Level Authorisation (BOLA) — cross-tenant data access  
**Description:** All `GET/PATCH/DELETE /listings/:id` endpoints currently have no ownership check. Any authenticated user can read, modify, or delete any other user's listing.  
**Likelihood:** 5 (almost certain — currently exploitable; the API is live)  
**Impact:** 5 (critical — mass PII exposure; financial damage; mandatory breach reporting)  
**Score:** 25 — CRITICAL  
**Treatment:** Mitigate  
**Controls in place:** None  
**Remaining actions:**
- [ ] Implement `ownership.ts` middleware — Sprint 0, Day 1
- [ ] Apply to all resource endpoints
- [ ] Enable Supabase RLS as defence-in-depth
- [ ] Pen test to verify no remaining BOLA vectors
**Owner:** Engineering Lead  
**Residual Score (after controls):** 2  
**Review Date:** July 2026

---

**RISK-006**  
**Title:** Role self-escalation via PATCH /users/me  
**Description:** The `UserUpdate` schema includes `role` as an accepted field, allowing any authenticated user to set their role to `admin`.  
**Likelihood:** 5 (near certain — trivially exploitable; any user can send `{"role":"admin"}`)  
**Impact:** 5 (critical — full admin access; all data exposed; platform destroyed)  
**Score:** 25 — CRITICAL  
**Treatment:** Mitigate  
**Controls in place:** None  
**Remaining actions:**
- [ ] Remove `role` from `UserUpdate` schema — Sprint 0, Day 1
- [ ] Audit: have any users already exploited this? (check users table for unexpected admin roles)
- [ ] Create separate `/admin/users/:id/role` endpoint gated to admin-only
**Owner:** Engineering Lead  
**Residual Score (after controls):** 1  
**Review Date:** July 2026

---

**RISK-007**  
**Title:** CORS wildcard allows any-origin credentialed requests  
**Description:** `cors({ credentials: true, origin: true })` mirrors any origin. A malicious website can make authenticated API calls on behalf of any logged-in user.  
**Likelihood:** 3 (possible — requires user to visit a malicious site while logged into PropUnified)  
**Impact:** 4 (high — CSRF-equivalent attack; account compromise; data theft)  
**Score:** 12 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:** None  
**Remaining actions:**
- [ ] Change to explicit `ALLOWED_ORIGINS` array — Sprint 0, Day 1
- [ ] Verify Clerk's CSRF protection is active
**Owner:** Engineering Lead  
**Residual Score (after controls):** 2  
**Review Date:** July 2026

---

**RISK-008**  
**Title:** No authentication on property creation/deletion endpoints  
**Description:** Anonymous users can call `POST /properties`, `PATCH /properties/:id`, and `DELETE /properties/:id` with no authentication.  
**Likelihood:** 4 (likely — publicly documented API, easy to discover)  
**Impact:** 4 (high — platform content integrity destroyed; fraudulent listings; data loss)  
**Score:** 16 — HIGH  
**Treatment:** Mitigate  
**Controls in place:** None  
**Remaining actions:**
- [ ] Add `requireAuth` to all write endpoints — Sprint 0, Day 1
- [ ] Add `requirePropertyOwnership` to patch/delete
**Owner:** Engineering Lead  
**Residual Score (after controls):** 2  
**Review Date:** July 2026

---

**RISK-009**  
**Title:** Sequential integer IDs enable enumeration  
**Description:** All tables use serial integer IDs. An attacker can enumerate IDs (1, 2, 3...) to harvest all resources if any read endpoint lacks an ownership check.  
**Likelihood:** 4 (likely — trivial to implement; exacerbated by current lack of ownership checks)  
**Impact:** 3 (medium — data exposure if combined with other vulnerabilities)  
**Score:** 12 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:**  
- Mitigated partially by ownership checks (once implemented)  
**Remaining actions:**
- [ ] Migrate all public-facing IDs to UUID v4 — Sprint 1
**Owner:** Engineering Lead  
**Residual Score (after controls):** 3  
**Review Date:** October 2026

---

**RISK-010**  
**Title:** Stored XSS via property descriptions  
**Description:** User-provided text in property descriptions, titles, and agent bios is stored and displayed without HTML sanitisation. A malicious listing with embedded `<script>` tags compromises any user who views it.  
**Likelihood:** 3 (possible — requires a malicious listing to go live; content moderation may catch obvious cases)  
**Impact:** 4 (high — session theft; admin compromise if admin views the listing)  
**Score:** 12 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:**  
- Zod schema validation rejects obviously malformed JSON  
**Remaining actions:**
- [ ] Implement DOMPurify sanitisation on insert — Sprint 1
- [ ] Output-encode on render in the frontend
- [ ] CSP blocks inline scripts
**Owner:** Engineering Lead  
**Residual Score (after controls):** 2  
**Review Date:** October 2026

---

**RISK-011**  
**Title:** `isPremium` flag exploitable without payment  
**Description:** Creating or patching a listing with `{"isPremium": true}` grants premium status for free with no payment verification.  
**Likelihood:** 4 (likely — trivially exploitable)  
**Impact:** 3 (medium — revenue loss; platform fairness)  
**Score:** 12 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:** None  
**Remaining actions:**
- [ ] Gate `isPremium` flag behind server-side payment verification only — Sprint 0, Day 3
- [ ] Audit existing premium listings against payment records
**Owner:** Engineering Lead  
**Residual Score (after controls):** 2  
**Review Date:** July 2026

---

### Category 3: Infrastructure & Platform

---

**RISK-012**  
**Title:** Supabase `anon` key with no Row Level Security  
**Description:** If RLS is not enabled on PII tables, the Supabase `anon` key (which is publicly visible in the frontend) gives direct database read access to all rows in those tables.  
**Likelihood:** 4 (likely — RLS not yet configured)  
**Impact:** 5 (critical — same as database breach)  
**Score:** 20 — CRITICAL  
**Treatment:** Mitigate  
**Controls in place:** None  
**Remaining actions:**
- [ ] Enable RLS on all PII tables — Sprint 0, Day 4
- [ ] Write and test all RLS policies from SECURITY_ARCHITECTURE.md Section 8.1
- [ ] Move `service_role` key to server-side only
**Owner:** Engineering Lead  
**Residual Score (after controls):** 3  
**Review Date:** July 2026

---

**RISK-013**  
**Title:** Admin panel publicly accessible on the internet  
**Description:** If the admin panel or Supabase dashboard is accessible without Zero Trust gating, a compromised credential gives full platform access.  
**Likelihood:** 3 (possible)  
**Impact:** 5 (critical — full platform takeover)  
**Score:** 15 — HIGH  
**Treatment:** Mitigate  
**Controls in place:**  
- Supabase dashboard requires Supabase account login  
**Remaining actions:**
- [ ] Cloudflare Zero Trust in front of any custom admin panel
- [ ] Hardware MFA mandatory for all admin accounts
- [ ] IP allowlist for admin access (office/VPN only)
**Owner:** Infrastructure Lead  
**Residual Score (after controls):** 3  
**Review Date:** September 2026

---

**RISK-014**  
**Title:** Secret leakage via git or build logs  
**Description:** API keys, database URLs, or encryption keys accidentally committed to the git repository or exposed in CI/CD build logs.  
**Likelihood:** 3 (possible — human error in any team)  
**Impact:** 5 (critical — depends on secret; full DB access if DATABASE_URL leaked)  
**Score:** 15 — HIGH  
**Treatment:** Mitigate  
**Controls in place:**  
- `.gitignore` protects `.env` files  
**Remaining actions:**
- [ ] Pre-commit hook with Trufflehog secret scanning
- [ ] Trufflehog in CI pipeline (blocks PR merge if secret detected)
- [ ] Audit git history for any accidental secret commits
- [ ] Ensure CI build logs do not echo env vars
**Owner:** Engineering Lead  
**Residual Score (after controls):** 3  
**Review Date:** September 2026

---

**RISK-015**  
**Title:** Supply chain attack via compromised npm dependency  
**Description:** A malicious actor compromises a popular npm package used in the project, inserting code to steal secrets, scrape payment pages, or create a backdoor.  
**Likelihood:** 2 (unlikely — rare but happens; Log4Shell, XZ Utils precedent)  
**Impact:** 5 (critical — code execution in production)  
**Score:** 10 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:**  
- `package-lock.json` pins versions  
- `npm audit` in CI  
**Remaining actions:**
- [ ] Dependabot alerts enabled on GitHub
- [ ] Snyk integration in CI for continuous scanning
- [ ] SRI for any CDN-loaded scripts
- [ ] Pin GitHub Action versions to SHA
**Owner:** Engineering Lead  
**Residual Score (after controls):** 4  
**Review Date:** Annually

---

### Category 4: Regulatory & Legal

---

**RISK-016**  
**Title:** GujRERA non-compliance — listing without RERA number  
**Description:** New project listings published without GujRERA RERA registration number, or without the QR code mandate (active since June 2025). Platform facilitates illegal advertising.  
**Likelihood:** 4 (likely — no validation currently enforced on listing creation)  
**Impact:** 4 (high — GujRERA can de-list listings; joint liability; financial penalties)  
**Score:** 16 — HIGH  
**Treatment:** Mitigate  
**Controls in place:** None currently  
**Remaining actions:**
- [ ] Make `reraNumber` a required field for `listingType = "new_project"` — Sprint 0
- [ ] GujRERA API verification on listing create — Sprint 2
- [ ] QR code generation service for each listing — Sprint 2
- [ ] Content review workflow before new project listings go live
**Owner:** Product / Compliance Lead  
**Residual Score (after controls):** 3  
**Review Date:** September 2026

---

**RISK-017**  
**Title:** TRAI DLT non-compliance — SMS blocked or enforcement action  
**Description:** Platform sends commercial SMS without DLT registration, causing all messages to be blocked or triggering TRAI enforcement.  
**Likelihood:** 4 (likely — DLT registration not confirmed as complete)  
**Impact:** 3 (medium — SMS communication disrupted; OTP delivery fails; user onboarding broken)  
**Score:** 12 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:** None confirmed  
**Remaining actions:**
- [ ] Complete DLT Principal Entity registration
- [ ] Register all sender IDs
- [ ] Register all SMS templates
- [ ] Whitelist all URLs in SMS
**Owner:** Product / Engineering  
**Residual Score (after controls):** 2  
**Review Date:** August 2026

---

**RISK-018**  
**Title:** PCI DSS scope creep — inadvertent card data handling  
**Description:** A code change results in card data flowing through Prop Unified's servers, blowing the SAQ A scope and triggering a full QSA audit obligation.  
**Likelihood:** 2 (unlikely if Razorpay integration is correctly maintained)  
**Impact:** 4 (high — QSA audit cost ₹10–30L; timeline disruption; potential card brand fines)  
**Score:** 8 — MEDIUM  
**Treatment:** Mitigate  
**Controls in place:**  
- Current integration uses Razorpay hosted checkout  
**Remaining actions:**
- [ ] Document SAQ A scope in payment architecture docs
- [ ] Add code review gate: any payment-related PR requires security review
- [ ] CSP prevents third-party scripts on payment pages
**Owner:** Engineering Lead  
**Residual Score (after controls):** 3  
**Review Date:** Annually

---

### Category 5: Business & Operational

---

**RISK-019**  
**Title:** Fake listing fraud at scale — buyer advance deposit theft  
**Description:** Bad actors create convincing fraudulent listings, collect advance payments outside the platform, and disappear. This is common in the Indian real estate market.  
**Likelihood:** 4 (likely — high motivation; real estate is a prime target)  
**Impact:** 4 (high — user harm; regulatory action; platform reputation collapse)  
**Score:** 16 — HIGH  
**Treatment:** Mitigate  
**Controls in place:**  
- KYC requirement for listing creation (kycVerified flag)  
**Remaining actions:**
- [ ] RERA number mandatory for new projects (reduces fraud risk for new builds)
- [ ] Agent RERA registration validation
- [ ] Photo geolocation verification for listings
- [ ] "Report this listing" mechanism for users
- [ ] Trust score / verified badge system for agents
- [ ] Clear platform messaging: "Never pay outside the platform"
**Owner:** Product / Trust & Safety  
**Residual Score (after controls):** 6  
**Review Date:** Quarterly

---

**RISK-020**  
**Title:** Platform unavailability (cloud provider outage)  
**Description:** Vercel, Render, or Supabase experiences a regional outage, taking the platform offline.  
**Likelihood:** 2 (unlikely — these platforms have high availability SLAs)  
**Impact:** 3 (medium — revenue loss; user frustration; no data loss)  
**Score:** 6 — LOW  
**Treatment:** Accept + Monitor  
**Controls in place:**  
- Vercel: global CDN with failover  
- Render: deployment in stable region  
- Supabase: automated backups + PITR  
**Remaining actions:**
- [ ] Document RTO (4 hours) and RPO (1 hour)
- [ ] Test recovery from Supabase PITR monthly
- [ ] Status page configured for user communication
**Owner:** Infrastructure Lead  
**Residual Score:** 4  
**Review Date:** Annually

---

## Risk Summary Dashboard

| ID | Title | Score | Level | Owner | Status |
|----|-------|-------|-------|-------|--------|
| RISK-001 | DPDP non-compliance | 15 | HIGH | DPO | In Progress |
| RISK-002 | PAN/Aadhaar plaintext | 20 | CRITICAL | Engineering | Sprint 0 |
| RISK-003 | PII scraping | 20 | CRITICAL | Engineering | Sprint 0 |
| RISK-004 | Breach notification failure | 16 | HIGH | CISO | In Progress |
| RISK-005 | BOLA — cross-tenant access | 25 | CRITICAL | Engineering | Sprint 0 |
| RISK-006 | Role self-escalation | 25 | CRITICAL | Engineering | Sprint 0 |
| RISK-007 | CORS wildcard | 12 | MEDIUM | Engineering | Sprint 0 |
| RISK-008 | No auth on write endpoints | 16 | HIGH | Engineering | Sprint 0 |
| RISK-009 | Sequential IDs | 12 | MEDIUM | Engineering | Sprint 1 |
| RISK-010 | Stored XSS | 12 | MEDIUM | Engineering | Sprint 1 |
| RISK-011 | isPremium bypass | 12 | MEDIUM | Engineering | Sprint 0 |
| RISK-012 | Supabase anon key / no RLS | 20 | CRITICAL | Engineering | Sprint 0 |
| RISK-013 | Admin panel exposed | 15 | HIGH | Infrastructure | Sprint 1 |
| RISK-014 | Secret leakage | 15 | HIGH | Engineering | Sprint 1 |
| RISK-015 | Supply chain attack | 10 | MEDIUM | Engineering | Sprint 1 |
| RISK-016 | GujRERA non-compliance | 16 | HIGH | Product/Compliance | Sprint 2 |
| RISK-017 | TRAI DLT non-compliance | 12 | MEDIUM | Product | Q3 2026 |
| RISK-018 | PCI DSS scope creep | 8 | MEDIUM | Engineering | Ongoing |
| RISK-019 | Fake listing fraud | 16 | HIGH | Product | Sprint 2 |
| RISK-020 | Cloud provider outage | 6 | LOW | Infrastructure | Accepted |

**Critical risks (score ≥ 20):** 5 — RISK-002, RISK-003, RISK-005, RISK-006, RISK-012  
**All five are Sprint 0 items — fix this week.**

---

*Review this register quarterly. Add new risks as they are identified. Update scores as controls are implemented. Archive closed risks (do not delete — keep for audit trail).*  
*Last reviewed: June 2026*  
*Next review: September 2026*
