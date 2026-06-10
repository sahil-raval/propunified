# DATA FLOW REGISTER
## Record of Processing Activities (RoPA)

**Project:** Prop Unified  
**Owner:** DPO / Privacy Lead  
**Version:** 1.0 — June 2026  
**Review Cadence:** Quarterly, or whenever a new data processing activity begins  
**Classification:** Internal — Confidential  
**Regulatory basis:** DPDP Act 2023 (best practice); IT Act §43A SPDI Rules (mandatory)

---

> This document is the formal Record of Processing Activities (RoPA). It must be maintained accurately and produced on request from the Data Protection Board or any regulatory authority. It is also the source of truth for the Data Principal rights portal (what data to export on an access request, and what to delete on an erasure request).

---

## Part 1 — Data Fiduciary Details

| Field | Value |
|-------|-------|
| Organisation name | Prop Unified (trading name) |
| Legal entity name | [To be filled — registered company name] |
| CIN | [To be filled on incorporation] |
| Registered address | [To be filled] |
| Data Protection Officer | [To be appointed — target Q3 2026] |
| DPO email | privacy@propunified.in |
| Grievance Officer | [To be named — India-resident individual] |
| Grievance email | grievance@propunified.in |
| Primary business | Online real estate marketplace — property listings, search, enquiry management, agent tools |
| Geographic scope | India (primary: Gujarat / Ahmedabad) |

---

## Part 2 — Data Processor Registry

All entities that process personal data on behalf of Prop Unified (as your Data Processors under the DPDP Act).

| # | Processor | Service | Data Categories Processed | Data Location | DPA Signed | Last Reviewed |
|---|-----------|---------|--------------------------|---------------|-----------|--------------|
| P1 | Supabase Inc. | PostgreSQL database hosting | All user PII, KYC data, enquiries, listings | ap-south-1 (Mumbai) | ☐ Pending | — |
| P2 | Vercel Inc. | Frontend SPA hosting + Edge Functions | Request headers, IP addresses (server logs) | Global CDN; logs in US (configure to limit) | ☐ Pending | — |
| P3 | Render Inc. | API server hosting | Processes all API request data transiently | Singapore / US (confirm India option) | ☐ Pending | — |
| P4 | Clerk Inc. | Authentication and identity management | Phone numbers, email, OAuth identity, session data | US (check data residency) | ☐ Pending | — |
| P5 | Razorpay Software Pvt. Ltd. | Payment processing | Payment reference data (no card data) | India | ✓ Via merchant agreement | — |
| P6 | MSG91 / [OTP Provider] | OTP and transactional SMS delivery | Phone numbers, OTP messages | India | ☐ Pending | — |
| P7 | Meta (WhatsApp BSP) | WhatsApp Business messaging | Phone numbers, message content | US / Global | ☐ Pending | — |
| P8 | Google (Maps API) | Property location, map display | Location queries, map tile requests | Global | ☐ Pending | — |
| P9 | Cloudflare Inc. | CDN, WAF, DDoS protection | IP addresses, request headers, cookies | Global (India PoP) | ☐ Pending | — |
| P10 | [Analytics Vendor — TBD] | Usage analytics | Page views, pseudonymised user IDs | TBD | ☐ Not yet | — |
| P11 | Exotel / [Proxy Number] | Phone number masking | Phone numbers | India | ☐ Not yet | — |

**Action required:** Sign Data Processing Agreements with all processors listed above before any production user data flows to them. DPA must include: DPDP Rule 6 safeguards, breach notification obligation (within 24h to you), data deletion on contract termination, audit rights.

---

## Part 3 — Processing Activities

Each activity is documented with: purpose, legal basis, data categories, retention period, and who can access the data.

---

### PA-001: User Registration & Account Creation

| Field | Detail |
|-------|--------|
| Activity name | User Registration |
| Purpose | Create an account enabling users to access platform features |
| Legal basis | **Consent** (Rule 4) + Contractual necessity |
| Data categories | Full name, phone number, email address, role (buyer/seller/agent), avatar URL |
| Special categories | None |
| Data source | User-provided at signup |
| Processors | Clerk (auth), Supabase (profile storage) |
| Third-party sharing | None beyond processors |
| Cross-border transfer | Clerk (US) — review data residency |
| Retention | Active account: duration of account. Inactive: 3 years from last login, then erasure (DPDP Rule 8 Third Schedule) |
| Erasure method | Soft-delete on account deletion → hard-delete after 48h. Related records anonymised |
| Access | User (own data), Admin |
| Data Principal Rights applicable | Access, Correction, Erasure, Grievance |
| Risk level | Medium |

---

### PA-002: KYC Identity Verification

| Field | Detail |
|-------|--------|
| Activity name | Know Your Customer (KYC) Verification |
| Purpose | Verify identity of agents and sellers before enabling listing creation. Fraud prevention and RERA compliance |
| Legal basis | **Consent** (Rule 4) + Legitimate interest (fraud prevention) |
| Data categories — Confidential | Full name, address, city, state, pincode, phone, email |
| Data categories — Restricted (SPDI) | PAN number (encrypted at rest), Aadhaar number (encrypted at rest) |
| Special categories | Government identifiers (Aadhaar) — highest sensitivity |
| Data source | User-provided |
| Processors | Supabase (encrypted storage), Supabase Storage (document images) |
| Third-party sharing | None (no UIDAI verification API currently) |
| Cross-border transfer | None — Supabase ap-south-1 |
| Retention | 5 years after account closure (PMLA obligations if applicable; best practice otherwise) |
| Erasure method | On account deletion: overwrite encrypted values with null. Retain retention-marker record for compliance |
| Access | User (own data — masked), KYC Admin (decrypted via admin API only) |
| Data Principal Rights | Access (masked display), Correction (via re-submission), Erasure (subject to PMLA retention) |
| Risk level | **Critical** — SPDI; Aadhaar Act applies |
| Special notes | Aadhaar number must be stored encrypted per Aadhaar Act. PAN number is SPDI per IT Act. Decryption only in authorised admin session |

---

### PA-003: Property Listing Management

| Field | Detail |
|-------|--------|
| Activity name | Property Listing — Create, Read, Update, Delete |
| Purpose | Enable property owners and agents to advertise properties for sale or rent |
| Legal basis | **Consent** + Contractual |
| Data categories | Property details (address, price, area, photos); RERA number; listing status; seller identity (linked to Clerk ID, not directly personal) |
| Special categories | None (ownerPhone stored but NOT returned in public API) |
| Data source | User-provided |
| Processors | Supabase (data), Supabase Storage / S3 (photos) |
| Third-party sharing | None |
| Cross-border transfer | None — India region |
| Retention | Active listings: duration. Inactive/sold/rented: 2 years for historical purposes, then anonymise |
| Erasure method | On account deletion: listings anonymised (seller_id set to null, seller details removed) |
| Access | Public (active listings — no contact info). Owner (own listings, full detail). Admin |
| Data Principal Rights | Access, Correction, Erasure |
| Risk level | Low-Medium |
| Special notes | `ownerPhone` field stored internally but NEVER returned in API response. Contact reveal is a separate, gated, audited operation |

---

### PA-004: Property Enquiry / Contact Submission

| Field | Detail |
|-------|--------|
| Activity name | Property Enquiry (Inquiry) Submission |
| Purpose | Allow potential buyers/renters to contact property owners/agents |
| Legal basis | **Consent** (buyer submitting their details) |
| Data categories | Buyer name, phone number, email, enquiry message, property ID |
| Special categories | None |
| Data source | User-provided (buyer submitting enquiry form) |
| Processors | Supabase |
| Third-party sharing | Shared with property owner (this is the purpose) |
| Cross-border transfer | None |
| Retention | 2 years from submission date |
| Erasure method | On buyer account deletion: anonymise name/phone/email in enquiry records |
| Access | Buyer (own enquiries), Property owner (enquiries on their properties), Admin |
| Data Principal Rights | Access, Erasure |
| Risk level | High (phone number of buyer shared with owner) |
| Special notes | Enquiry form currently accepts anonymous submissions. Consider requiring auth or CAPTCHA. Phone number is the highest-sensitivity field here |

---

### PA-005: Contact Reveal (Owner Phone Disclosure)

| Field | Detail |
|-------|--------|
| Activity name | Property Owner Contact Reveal |
| Purpose | Allow authenticated buyers to view the property owner's/agent's contact phone number |
| Legal basis | **Consent** of owner (who listed their phone knowing it would be revealed to enquirers) |
| Data categories | Owner phone number, owner name |
| Special categories | None |
| Data source | Owner-provided at listing creation |
| Processors | None (internal operation) |
| Third-party sharing | Revealed to the requesting buyer (logged) |
| Cross-border transfer | None |
| Retention | Audit log of reveal events: 1 year |
| Erasure method | Audit logs retained per retention policy; phone number erasure when owner account is deleted |
| Access | Authenticated buyers (rate-limited, 10/hour); Audit log accessible to Admin only |
| Data Principal Rights | Owner can request access to see who viewed their contact (via audit log) |
| Risk level | **High** — this is the highest-value PII on the platform; prime scraping target |
| Special notes | Every reveal is logged with actorId, propertyId, IP hash, timestamp. Rate limited. Future: replace with proxy phone numbers |

---

### PA-006: Payment Processing

| Field | Detail |
|-------|--------|
| Activity name | Premium Subscription / Listing Boost Payment |
| Purpose | Process payment for premium listing features |
| Legal basis | Contractual necessity |
| Data categories | Razorpay order ID, payment ID, payment amount, user ID, plan type |
| Special categories | **No card data** — Razorpay handles all card/bank data |
| Data source | Generated by Razorpay; reference IDs returned to Prop Unified |
| Processors | Razorpay (primary payment processor — PCI DSS Level 1) |
| Third-party sharing | Razorpay (all financial detail). Tax authorities (GST returns — aggregated) |
| Cross-border transfer | None — Razorpay stores payment data in India |
| Retention | 8 years (GST / Income Tax audit requirement) |
| Erasure method | NOT erasable — required for tax compliance. Anonymise user linkage if user requests erasure of other data |
| Access | User (own payment history), Admin, Finance |
| Data Principal Rights | Access. Erasure NOT available for financial transaction records (statutory retention) |
| Risk level | Medium |
| Special notes | Razorpay is the data controller for payment data itself. Our obligation is to manage the order reference data and secure the integration |

---

### PA-007: Analytics & Platform Improvement

| Field | Detail |
|-------|--------|
| Activity name | Usage Analytics |
| Purpose | Understand how users interact with the platform; improve features; detect anomalies |
| Legal basis | **Consent** (analytics purpose in consent notice) |
| Data categories | Page views, search queries, feature interactions, pseudonymised user IDs |
| Special categories | None |
| Data source | Automatically collected from user sessions |
| Processors | [Analytics vendor — TBD; must be India-resident or with DPA] |
| Third-party sharing | Analytics vendor only |
| Cross-border transfer | Depends on vendor — minimise or avoid |
| Retention | 2 years |
| Erasure method | Delete records linked to pseudonymised user ID on account deletion |
| Access | Product team (aggregated), Admin |
| Data Principal Rights | Erasure (delete pseudonymised data linked to their account) |
| Risk level | Low (pseudonymised) |
| Special notes | Never send raw personal data (name, phone, email) to analytics tools. Send only pseudonymised identifiers |

---

### PA-008: Newsletter / Marketing Communications

| Field | Detail |
|-------|--------|
| Activity name | Newsletter and Property Alert Emails/SMS |
| Purpose | Send property updates, market insights, and platform news to users who have opted in |
| Legal basis | **Consent** (explicit opt-in required; no pre-ticked boxes) |
| Data categories | Email address, phone number, communication preferences, opt-in timestamp |
| Special categories | None |
| Data source | User-provided at registration or via settings |
| Processors | [Email provider — TBD], MSG91 / [SMS provider] |
| Third-party sharing | Email and SMS providers only |
| Cross-border transfer | Depends on email provider — minimise |
| Retention | Duration of consent + 3 years (legal evidence of consent) |
| Erasure method | On opt-out: stop communications immediately. On account deletion: delete all marketing data |
| Access | Marketing team, Admin |
| Data Principal Rights | Withdrawal of consent (immediate), Erasure |
| Risk level | Low-Medium |
| Special notes | DLT registration required for all SMS communications (TRAI TCCCPR 2018). WhatsApp: opt-in required; template messages only |

---

### PA-009: Audit Logging & Security Monitoring

| Field | Detail |
|-------|--------|
| Activity name | Security Audit Logging |
| Purpose | Detect security incidents; support forensic investigation; evidence of compliance; CERT-In obligation |
| Legal basis | **Legitimate interest** (security) + Legal obligation (CERT-In; DPDP Rule 6) |
| Data categories | User actions, timestamps, IP addresses (hashed), user agent strings, resource IDs |
| Special categories | None (IP addresses are hashed before storage — not raw IPs) |
| Data source | Automatically generated by application |
| Processors | Supabase (audit_log table), S3 (immutable log archive) |
| Third-party sharing | CERT-In (on incident report), DPB (on breach notification), legal/law enforcement (on lawful order) |
| Cross-border transfer | None — India region storage |
| Retention | **1 year minimum** (DPDP Rule 6); 180 days in India (CERT-In) — retain 1 year to satisfy both |
| Erasure method | NOT erasable per retention period. After retention period expires: automated deletion |
| Access | Admin only (read-only). Incident Commander during incident. Regulators on lawful request |
| Data Principal Rights | Access (user can request a summary of actions recorded against their account, NOT the full log). Erasure: NOT available during retention period |
| Risk level | Low (hashed IPs; no raw PII in standard log fields) |
| Special notes | Audit log is append-only. Application code has no DELETE permission on this table. Separate privileged DB role handles archival |

---

### PA-010: Customer Support / Grievance Handling

| Field | Detail |
|-------|--------|
| Activity name | Customer Support and Grievance Redressal |
| Purpose | Resolve user complaints; fulfil DPDP and Consumer Protection Act obligations |
| Legal basis | **Legal obligation** (IT Rules 2026 grievance mechanism; Consumer Protection Act) |
| Data categories | Name, email, phone, nature of complaint, correspondence history |
| Special categories | None |
| Data source | User-provided via support form |
| Processors | [Support ticketing system — TBD], Email provider |
| Third-party sharing | None |
| Cross-border transfer | Minimise — prefer India-region support tools |
| Retention | 3 years from complaint resolution |
| Erasure method | After retention: delete correspondence. Retain anonymised statistics |
| Access | Grievance Officer, Support team, Admin |
| Data Principal Rights | Access to their own complaint history, Erasure after retention period |
| Risk level | Low |
| Special notes | DPDP complaint must be acknowledged within 24 hours; resolved within 90 days. Consumer Protection Act: acknowledge within 48 hours; resolve within 1 month |

---

## Part 4 — Data Flow Diagrams

### Flow 1: User Registration

```
User (Browser)
    │
    │ POST /signup (phone/email) via Clerk SDK
    ▼
Clerk Platform ──────────────────► OTP sent via SMS provider
    │
    │ JWT token issued on successful OTP verification
    ▼
Prop Unified API Server
    │
    │ Auto-provision user record (clerkId, role=buyer)
    ▼
Supabase (users table)
    │
    │ Response: user profile (no sensitive fields)
    ▼
User (Browser)
```

**Data residency:** Clerk (US — review), Supabase (Mumbai), SMS provider (India)

---

### Flow 2: KYC Submission

```
User (Browser)
    │
    │ POST /api/kyc { fullName, panNumber, aadhaarNumber, ... }
    │ HTTPS — TLS 1.3
    ▼
API Server (Render)
    │
    │ 1. requireAuth — verify Clerk JWT
    │ 2. kycSubmitLimiter — rate check
    │ 3. Zod validate PAN format, Aadhaar format
    │ 4. encryptField(panNumber) → panNumberEnc
    │ 5. encryptField(aadhaarNumber) → aadhaarNumberEnc
    │ 6. Store aadhaarLast4, panFirst5 (plaintext, for display)
    ▼
Supabase (kyc table)
    │ Stores: encrypted values only
    │ RLS: user reads own record only; admin via service_role
    │
    ▼
Admin Review (separate flow)
    │ Admin authenticates via Zero Trust + MFA
    │ GET /admin/kyc/:id
    │ API decrypts on demand — in authorised session only
    │ Admin updates status to approved/rejected
    ▼
User notified (SMS/email — no KYC data in notification)
```

---

### Flow 3: Property Enquiry → Contact Reveal

```
Buyer (Browser)
    │
    │ 1. Views property listing page
    │    GET /api/properties/:id
    │    Response: property details, NO ownerPhone
    │
    │ 2. Clicks "Show Contact"
    │    POST /api/properties/:id/contact
    │    requireAuth + contactRevealLimiter (10/hr)
    ▼
API Server
    │
    │ Look up property owner from users table
    │ Write audit_log: contact_reveal event
    │ (Future: return proxy number, not real number)
    ▼
Response to Buyer: { phone: "9876543210", name: "Owner Name" }
    │
    │ In parallel:
    ▼
Audit Log (Supabase)
    │ actorId, propertyId, ownerUserId, ipHash, timestamp
```

---

### Flow 4: Payment for Premium Listing

```
Seller (Browser)
    │
    │ 1. POST /api/payments/orders { planType: "premium_listing_30d" }
    │    requireAuth
    ▼
API Server
    │
    │ Server-side price lookup (ignores any price in request body)
    │ Create Razorpay Order → orderId returned
    ▼
Seller (Browser)
    │
    │ 2. Load Razorpay checkout widget
    │    Payment UI served by Razorpay (not PropUnified)
    │    Card data NEVER touches PropUnified servers
    ▼
Razorpay ────────────────────────► Issuer bank (2FA, card processing)
    │
    │ 3. Razorpay calls browser callback with:
    │    razorpay_order_id, razorpay_payment_id, razorpay_signature
    │
    │ 4. Browser sends these to POST /api/payments/verify
    ▼
API Server
    │
    │ HMAC signature verification (timingSafeEqual)
    │ Cross-verify with Razorpay Orders API
    │ If verified: update listing isPremium=true
    │ Write audit_log: payment_verified
    │
    │ 5. Razorpay also sends webhook (server-to-server)
    │    POST /api/payments/webhook
    │    Signature verified before processing
    ▼
Supabase (listings table updated)
```

---

## Part 5 — Data Subject Rights Request Log

> Maintain this log for every Data Principal rights request received. Required for DPDP compliance evidence.

| Request ID | Date Received | Data Principal ID | Right Requested | Date Acknowledged | Date Completed | Notes |
|-----------|---------------|------------------|-----------------|-------------------|----------------|-------|
| DSR-001 | | | | | | |
| DSR-002 | | | | | | |

**SLA:** Acknowledge within 24 hours. Complete within 90 days (DPDP Rule).  
**Escalation:** If cannot complete within 60 days, notify DPO and legal counsel.

---

## Part 6 — Cross-Border Data Transfer Register

All transfers of personal data outside India must be documented. Transfers are only permitted to countries/sectors for which the Central Government has made an adequacy determination.

| Processor | Data Categories | Destination Country | Transfer Mechanism | Adequacy Status | Action Required |
|-----------|----------------|--------------------|--------------------|-----------------|----------------|
| Clerk | Phone, email, session | United States | Vendor DPA | Not yet determined | Review Clerk data residency options; negotiate India-region storage |
| Vercel | Request logs (IP, UA) | United States | Vendor DPA | Not yet determined | Configure log retention to India-only; purge US copies |
| Render | API request data (transient) | Singapore/US | Vendor DPA | Not yet determined | Evaluate Render India region availability |
| Meta (WhatsApp) | Phone numbers | United States | Vendor DPA | Not yet determined | Assess necessity; minimise data sent |
| Google Maps | Location queries | Global | Google DPA | Not yet determined | Use client-side Maps (no user data sent to Maps API from server) |

**Risk mitigation strategy:** Maximise India-region data residency. Where US transfers are unavoidable (Clerk, Vercel), implement DPAs with contractual safeguards. Monitor Central Government adequacy determinations for US.

---

*This register must be updated whenever a new processing activity begins, a new processor is engaged, or an existing activity's scope changes.*  
*DPO must review quarterly.*  
*Last reviewed: June 2026*  
*Next review: September 2026*
