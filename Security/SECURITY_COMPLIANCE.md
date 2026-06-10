# PROP UNIFIED — Security, Governance, Risk & Compliance (SGRC) Master Reference

**Scope:** Prop Unified (Indian real estate marketplace, Gujarat focus)  
**Classification:** Internal — Security & Compliance Team  
**Date:** 09 June 2026  
**Author:** Shreyas Vivek  
**Version:** 1.1  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete Regulatory & Compliance Landscape](#2-complete-regulatory--compliance-landscape)
   - 2.1 Data Privacy & Protection Laws
   - 2.2 Cybersecurity Legislation & Directions
   - 2.3 Sector-Specific Real Estate Regulations
   - 2.4 Payment & Financial Regulations
   - 2.5 Telecom & Communication Regulations
   - 2.6 Consumer Protection & E-Commerce Rules
   - 2.7 Anti-Money Laundering & KYC Obligations
   - 2.8 Tax Compliance Obligations
   - 2.9 Foreign Exchange & NRI Compliance
   - 2.10 Competition & Antitrust Law
   - 2.11 Intellectual Property & Content
   - 2.12 Accessibility Standards
   - 2.13 International & Voluntary Standards
3. [Threat Model Summary](#3-threat-model-summary)
4. [Security Architecture Summary](#4-security-architecture-summary)
5. [Data Governance & Classification](#5-data-governance--classification)
6. [Privacy Engineering & DPDP Operationalisation](#6-privacy-engineering--dpdp-operationalisation)
7. [Security Governance Structure](#7-security-governance-structure)
8. [Compliance Roadmap](#8-compliance-roadmap)
9. [Audit & Assurance Programme](#9-audit--assurance-programme)
10. [Master Compliance Checklist](#10-master-compliance-checklist)
11. [Key Regulatory Contacts](#11-key-regulatory-contacts)

---

## 1. Executive Summary

PROP UNIFIED is a digital marketplace facilitating real estate transactions in India. As an operator collecting and processing personal data of Indian citizens, handling financial information, mediating property transactions, and serving as a communications channel — the platform is subject to a complex, multi-layered regulatory environment.

**The five highest-urgency items:**

| # | Risk | Deadline | Penalty |
|---|------|----------|---------|
| 1 | DPDP Act / Rules 2025 — full operational compliance | 13 May 2027 | ₹250 crore per violation |
| 2 | CERT-In breach notification — 6-hour clock | Immediate (law active) | ₹1 lakh + 1yr imprisonment |
| 3 | GujRERA QR code + RERA number mandate on all listings | Active since 15 Jun 2025 | Project de-listing + penalties |
| 4 | IT Amendment Rules 2026 — AI content labelling, 3-hour takedown | Active since 20 Feb 2026 | Loss of safe harbour |
| 5 | RBI PA Master Direction 2025 — merchant KYC, PCI DSS | Active; KYC deadline 31 Dec 2025 | RBI action against Razorpay / you |

---

## 2. Complete Regulatory & Compliance Landscape

### 2.1 Data Privacy & Protection Laws

#### A. Digital Personal Data Protection (DPDP) Act 2023 + Rules 2025

**Status:** Rules notified 13–14 November 2025. Full compliance deadline **13 May 2027**.

**Classification:** Data Fiduciary. Supabase, Vercel, Render, Razorpay, SMS/WhatsApp vendors are Data Processors.

**Phased Timeline:**

| Milestone | Date |
|-----------|------|
| Rules notified | 13–14 Nov 2025 |
| Data Protection Board constituted | Jan 2026 (est.) |
| Consent Manager window | By 13 Nov 2026 |
| Full obligations | **13 May 2027** |

**Rule 3 — Consent Notice:** Itemised, plain-language notice before data collection. Available in **English, Hindi, and Gujarati**.

**Rule 4 — Consent Mechanism:** Clear, affirmative, specific, informed, free act. No pre-ticked boxes. Timestamped consent records with notice version.

**Rule 5 — Deemed Consent:** Document where you rely on deemed consent (service provision, legal obligation).

**Rule 6 — The Seven Mandatory Security Safeguards:**

| # | Requirement | Implementation |
|---|-------------|----------------|
| 1 | Encryption in storage and transit | TLS 1.3 + AES-256 at rest; AES-256-GCM for PAN/Aadhaar |
| 2 | Access controls | RBAC + Supabase RLS + IAM least privilege |
| 3 | Data masking / anonymisation | ownerPhone masked from API; pseudonymise analytics |
| 4 | Monitoring | Centralised audit log on every PII access |
| 5 | Log retention ≥ 1 year | Immutable S3 log store, 12-month retention |
| 6 | Incident response | Documented runbook, tabletop drills — see INCIDENT_RESPONSE_RUNBOOK.md |
| 7 | Backup & business continuity | Automated encrypted backups, tested restores |

**Rule 7 — Breach Notification:** Two mandatory clocks from moment of awareness:
- **CERT-In:** 6 hours (see INCIDENT_RESPONSE_RUNBOOK.md for template)
- **Data Protection Board:** 72 hours full report
- **Affected Data Principals:** "Without delay" in plain language

**Rule 8 — Retention & Erasure:**
- Erase once purpose is served or consent withdrawn
- Three-year inactivity deletion rule (Third Schedule)
- 48-hour advance notice to user before erasure
- Automated deletion jobs with audit trails

**Data Principal Rights (respond within 90 days):**
- Access summary, correction, completion, erasure
- Grievance redressal, right to nominate
- Build self-service — manual handling won't scale

**Significant Data Fiduciary (SDF) Risk:** If designated, additional obligations: annual DPIA, independent audit, mandatory India-resident DPO, algorithmic fairness assessment.

**Children's data:** Under-18 requires verifiable parental consent. Targeted advertising and profiling prohibited.

**Processor obligations (flow-down in every vendor contract):** Same seven safeguards, breach notification to you, process only on your instructions, delete on termination, allow audits.

**Cross-border transfers:** Avoid by keeping all data in India (Supabase ap-south-1).

---

#### B. IT Act 2000 — Section 43A + SPDI Rules

SPDI includes: passwords, financial information, health data, biometric data.  
Safe harbour: ISO 27001 or documented security programme.  
Body corporates must maintain "reasonable security practices" for SPDI.

---

#### C. Aadhaar Act 2016 + UIDAI Authentication Guidelines

- Aadhaar authentication requires UIDAI AUA/KUA licence — not available to all entities
- **Never store Aadhaar number in plaintext.** Use UIDAI-compliant Aadhaar Data Vault with tokenisation
- Biometric data must not be stored on any persistent database
- For marketplace use: **Offline/Paperless eKYC** (QR-code based) or DigiLocker integration is the right approach
- Recommended: use Aadhaar eKYC only for agent RERA verification, not general user onboarding

---

### 2.2 Cybersecurity Legislation & Directions

#### A. IT Act 2000 — Key Sections

| Section | Your Obligation |
|---------|----------------|
| §43A | Maintain reasonable security practices for SPDI; compensation liability for negligent handling |
| §66 | Report computer-related offences |
| §69 | Enable lawful interception when directed by government |
| §70B | Respond to CERT-In directions; mandatory breach reporting |
| §72A | Intermediary confidentiality obligations |
| §79 | Safe harbour (maintain by complying with due diligence obligations) |

#### B. CERT-In Directions 2022 (Active)

**Mandatory 6-hour reporting** for 20 incident categories including:
- Compromise of IT systems/data
- Unauthorised access to IT systems
- Attacks on e-commerce applications **(you are in scope)**
- Attacks on digital payment systems **(you are in scope)**
- Data breach / data leakage
- Attacks on cloud infrastructure
- Malicious code attacks

**Other obligations:**
- **Log retention: 180 days within India** (meet DPDP's 1-year to satisfy both)
- **NTP synchronisation:** Sync to NPL/NPLI servers
- KYC for VPN/cloud users maintained for 5 years

**CERT-In Audit Guidelines (July 2025):**
Comprehensive audit lifecycle now defined. Use CERT-In empanelled auditor annually.

#### C. IT Amendment Rules 2026 (Active since 20 February 2026)

**Your obligations as an intermediary:**

| Obligation | Timeline |
|-----------|----------|
| Takedown on lawful order | **3 hours** |
| Grievance redressal | **7 days** |
| AI/synthetic content labelling | Immediate |
| Permanent metadata on AI content | Immediate |

**Named Grievance Officer** (India-resident): acknowledge within 24 hours, resolve within 7 days.

**AI/Synthetic content:** Any AI-generated property images, floor plans, or descriptions must be prominently labelled and embedded with permanent provenance metadata.

**SSMI threshold:** 5 million registered users triggers additional obligations — Chief Compliance Officer, Nodal Contact Person (24×7), monthly compliance reports.

---

### 2.3 Sector-Specific Real Estate Regulations

#### A. Real Estate (Regulation and Development) Act 2016 + GujRERA

**Immediate operational obligations:**

| Requirement | Status | Action |
|-------------|--------|--------|
| RERA number on all new project listings | **Active** | Display on every listing card |
| GujRERA QR code in all advertisements | **Active since 15 Jun 2025** | Generate QR per listing |
| Agent RERA registration capture | **Active** | Validate before agent can list |
| Quarterly project progress display | **Active** | Pull from GujRERA API |
| No misleading advertising | **Active** | Pre-publish content review |

**What to display on every new project listing:**
- RERA registration number and validity date
- Developer name, PAN, registered address
- Land title status and encumbrances
- Project completion timeline and current progress
- Escrow account details (70% of buyer collections)
- Legal cases / complaints filed against developer

**Penalties:**
- Developer: up to 5% of project cost; up to 10% or 3 years imprisonment for ongoing violation
- Agent: ₹10,000/day for advertising without RERA number
- Platform: joint liability as co-facilitator

#### B. Transfer of Property Act 1882

Informs valid transfer mechanisms and required documentation for listings.

#### C. Registration Act 1908 + Gujarat Stamp Act

**For your financial calculator tools:**
- Stamp duty: **4.9%** (residential/commercial, higher of Jantri or transaction value)
- Registration: **1%** (waived for women buyers — display this)
- Agricultural land: **3%**
- Penalty for delayed payment: 2% monthly or 200% of deficit
- Link to GARVI portal for e-stamping

---

### 2.4 Payment & Financial Regulations

#### A. RBI Master Direction on Payment Aggregators (September 2025)

Supersedes all prior RBI PA circulars.

**Your obligations as Razorpay merchant:**
- Complete merchant KYC with Razorpay (deadline: **31 December 2025**; services restricted from 1 Jan 2026 if not done)
- Provide accurate PAN, GSTIN, bank account details
- Do not circumvent Razorpay's fraud controls

**If you hold and disburse funds yourself (booking deposits, escrow):** triggers PA licensing requirements. Strong legal advice required. Use Razorpay's split-payment / escrow features instead.

#### B. PCI DSS v4.0.1 (Mandatory since 31 March 2025)

| Integration Pattern | SAQ Type | Effort |
|-------------------|----------|--------|
| Razorpay redirect/hosted checkout only | **SAQ A** — 22 questions | Low |
| Razorpay.js with iframed fields | SAQ A-EP — ~190 questions | Medium |
| Any card data on your server | SAQ D — 350+ questions | Very high |

**Stay in SAQ A:** Use only Razorpay redirect checkout. No JS on your page that can read the payment form.

**New v4.0.1 requirements (no grace period):**
- **Req 6.4.3:** Inventory all scripts on payment pages; written justification + integrity controls (SRI)
- **Req 11.6.1:** Mechanism to detect unauthorised changes to HTTP headers and scripts on payment page — implement CSP `report-to`

#### C. RBI Tokenisation Mandate

Never store raw card data. Use Razorpay tokenisation for saved cards.

#### D. SEBI (Future-scoped)

If you enable fractional investment or REITs, SEBI's framework applies. Monitor India's Asset Tokenisation Bill 2026.

---

### 2.5 Telecom & Communication Regulations

#### A. TRAI TCCCPR 2018 + 2025 Amendments

**Pre-registration requirements before any commercial SMS:**

| Step | Action |
|------|--------|
| 1 | Register as Principal Entity on DLT platform |
| 2 | Register all sender IDs / headers (e.g., PROPFY) |
| 3 | Register all SMS templates |
| 4 | Whitelist all URLs used in SMS (since Oct 2024) |

**Real estate is Category 2.** Users can block all real estate commercial communications. Honour DND.

**2025 amendments:** Complaint threshold reduced to 5 complaints in 10 days (action triggered). Operator response time: 5 days.

**WhatsApp Business API:**
- Register via BSP (Business Solution Provider)
- All templates approved by Meta before sending
- Capture and store opt-in with timestamp; honour opt-out immediately

**Voice calls:** No promotional calls before 9 AM or after 9 PM.

#### B. Telecom Act 2023

Monitor implementing rules for impact on OTP delivery and CLI.

---

### 2.6 Consumer Protection & E-Commerce Rules

#### A. Consumer Protection Act 2019 + E-Commerce Rules 2020

**Mandatory platform disclosures:**
- Legal name, registered address, CIN
- Email + helpdesk contact
- **GSTIN**
- Name and contact of Grievance Officer

**Grievance redressal:**
- Acknowledge within **48 hours**
- Resolve within **1 month**
- Named individual, not a generic contact

**Seller/agent verification:**
- Obtain undertaking that listings are accurate and lawful
- Remove repeat-offender sellers/agents

**Consent:** No pre-ticked checkboxes. No automatic consent recording.

**Listing practices:**
- Sponsored/featured listings must be labelled "Sponsored" — search ranking manipulation is prohibited
- No fake reviews or rating manipulation
- Clear refund/cancellation policy for paid plans

#### B. ASCI Code (Voluntary, but cited in enforcement)

- All property ads must be truthful
- RERA number mandatory in property ads (aligns with GujRERA)
- No unsubstantiated superlatives ("Best", "No. 1")

---

### 2.7 Anti-Money Laundering & KYC Obligations

#### A. Prevention of Money Laundering Act (PMLA) 2002

Real estate is a FATF-designated high-risk sector for money laundering.

**Current status:** Real estate portals are not yet formally "reporting entities" under PMLA (mid-2026), but enforcement direction is clear.

**Implement proactively:**
- KYC for high-value transaction participants (transactions ≥ ₹50 lakh)
- Suspicious transaction monitoring (cash payment claims, unusual pricing, NRI patterns)
- PEP (Politically Exposed Person) screening for high-value accounts
- Document retention for 5 years

**If you enable booking deposits / payment escrow:** PMLA reporting entity classification likely. Mandatory: KYC, STR filing with FIU-IND, record-keeping.

---

### 2.8 Tax Compliance Obligations

#### A. GST

| Transaction | Rate | Your Action |
|-------------|------|------------|
| Platform subscription fees | 18% | Collect, invoice, file returns |
| Lead generation fees | 18% | Collect, invoice |
| Listing/boost fees | 18% | Collect, invoice |
| Under-construction property (displayed) | 5% | Inform buyers |
| Ready-to-move-in (displayed) | 0% | Label clearly |

**GST TCS (Section 52, CGST Act):** If marketplace model collecting payments for sellers: deduct 1% TCS on net taxable value; file GSTR-8 monthly.

#### B. Income Tax — Section 194O

- Deduct TDS at **0.1%** of gross sales on e-commerce payouts (rate as of Oct 2024)
- File Form 26Q quarterly; issue Form 16A annually
- Exemption: participants with gross sales < ₹5 lakh who have furnished PAN/Aadhaar

#### C. Section 194-IA (Buyer Obligation)

Buyers must deduct 1% TDS on property purchase price ≥ ₹50 lakh. Not your obligation, but **display this prominently** on the platform — failure to inform creates reputational and potential co-liability risk.

#### D. Payment Records

Retain for **8 years** (GST audit requirement).

---

### 2.9 Foreign Exchange & NRI Compliance

#### A. FEMA 1999

**What NRI buyers can purchase:**
- Residential and commercial property (unlimited)
- **Cannot purchase:** agricultural land, farmhouse, plantation without RBI approval

**Payment:** Must come from NRE/NRO account or inward remittance — not foreign currency cash.

**Repatriation:** Up to 2 residential properties' proceeds; NRO account limited to USD 1 million/year.

**Platform obligations:**
- Display FEMA restrictions on NRI-relevant listings
- For international users: clear FEMA disclaimer
- Do not facilitate FEMA-prohibited transactions (agricultural land to NRI)

#### B. FDI Policy (Platform Itself)

Your platform is a technology services company. FDI up to 100% via automatic route is available. Document this classification carefully when raising foreign VC.

---

### 2.10 Competition & Antitrust Law

#### A. Competition Act 2002 + Amendment 2023

**Risk areas as you scale:**
- Exclusive listing agreements with builders/developers
- Predatory pricing to eliminate competitors
- Data-driven market power (large datasets as evidence of dominance)
- Search ranking manipulation

**Safe practices:**
- No exclusive listing agreements
- Subscription/fee structures publicly available and non-discriminatory
- Document ranking algorithms internally
- No predatory pricing

---

### 2.11 Intellectual Property & Content

#### A. Copyright Act 1957

Property photos, floor plans, architectural drawings, and descriptions are copyrighted.
- Terms of Service must include an IP licence grant from users to the platform
- Do not republish photos from other portals without licence
- Watermark processed images

#### B. Trade Marks Act 1999

Register brand name, logo, and app name in:
- Class 36 (real estate services)
- Class 42 (software / technology services)

---

### 2.12 Accessibility Standards

#### A. Rights of Persons with Disabilities Act 2016

Section 42: websites providing public services must comply with accessibility standards.

#### B. Target Standard: WCAG 2.2 Level AA

| Principle | Key Requirement |
|-----------|----------------|
| Perceivable | Alt text for property photos; 4.5:1 colour contrast |
| Operable | Keyboard-accessible; touch targets ≥ 44×44px |
| Understandable | Descriptive error messages; consistent navigation |
| Robust | Screen reader compatible (VoiceOver, TalkBack); semantic HTML |

#### C. GuDApps (Mobile)

Government guidelines for accessible mobile app development — apply to React Native app.

---

### 2.13 International & Voluntary Standards

#### A. ISO/IEC 27001:2022 — ISMS

**Target: achieve certification.** Direct evidence for DPDP Rule 6 compliance. Safe harbour under SPDI Rules.
- Timeline: 3–6 months implementation; 1–2 months audit
- Cost in India: ₹4–12 lakh (consultant + certification body)
- Annual surveillance audits

**Critical Annex A controls for your stack:**

| Control | Why |
|---------|-----|
| 5.23 Cloud security | Supabase, Vercel, Render |
| 8.10 Information deletion | DPDP Rule 8 erasure jobs |
| 8.11 Data masking | PII in logs and analytics |
| 8.28 Secure coding | SAST in CI pipeline |
| 8.29 Security testing | Annual pen test |

#### B. ISO/IEC 27701:2019 — PIMS

Extension to ISO 27001 for privacy. Maps directly to DPDP. Implement after ISO 27001.

#### C. OWASP Standards (Non-negotiable technical baselines)

| Standard | What it governs |
|----------|----------------|
| OWASP Top 10 Web (2021) | Web vulnerabilities |
| OWASP API Security Top 10 (2023) | API vulnerabilities — your primary surface |
| OWASP MASVS v2 | Mobile (React Native) security |
| OWASP ASVS v4 | Web application verification standard |

#### D. NIST CSF 2.0 + CIS Controls v8

Use as governance structure organiser. CIS IG1 (first 6 controls) is your immediate baseline.

#### E. PCI DSS v4.0.1

All 51 future-dated requirements mandatory since 31 March 2025. No grace period.

---

## 3. Threat Model Summary

*Full detail in SECURITY_ARCHITECTURE.md. Summary of highest-priority threats:*

| Threat | Likelihood | Impact | Priority |
|--------|-----------|--------|---------|
| PII/contact scraping | HIGH | HIGH — DPDP breach + commercial loss | P0 |
| BOLA — cross-tenant data access | HIGH (currently exploitable) | CRITICAL | P0 |
| Account takeover via OTP interception | MEDIUM | HIGH | P1 |
| Fake listing fraud | MEDIUM | HIGH — platform trust + RERA | P1 |
| Payment webhook forgery | LOW | HIGH — revenue loss | P1 |
| Admin panel compromise | LOW | CRITICAL — full platform | P1 |
| Supply chain — malicious npm package | MEDIUM | HIGH | P2 |
| Stored XSS in listing descriptions | MEDIUM | MEDIUM | P2 |

---

## 4. Security Architecture Summary

*Full detail in SECURITY_ARCHITECTURE.md.*

**8-layer defence in depth:**

```
Layer 1: Cloudflare Edge (WAF, DDoS, Bot Mgmt, TLS, Rate Limit, Zero Trust)
Layer 2: Express Middleware (Security Headers, CORS Allowlist, Request Limits)
Layer 3: Authentication (Clerk JWT, server-side role lookup)
Layer 4: Authorisation (RBAC + Ownership checks)
Layer 5: Input Validation (Zod schema, HTML sanitisation)
Layer 6: Database (Drizzle parameterised queries + Supabase RLS)
Layer 7: Output Sanitisation (strip PII from responses, mask in logs)
Layer 8: Audit Log (immutable, append-only event record)
```

---

## 5. Data Governance & Classification

*Full RoPA in DATA_FLOW_REGISTER.md.*

| Class | Examples | Encryption | Access |
|-------|---------|------------|--------|
| Public | Listing details (no contact) | Standard | Open |
| Internal | Platform analytics, dashboards | Standard | Auth required |
| Confidential PII | Names, emails, phones, enquiry history | At-rest | Owner + Admin |
| Restricted — SPDI | PAN, Aadhaar numbers, bank details | **Field-level AES-256-GCM** | Owner (masked) + KYC Admin only |

---

## 6. Privacy Engineering & DPDP Operationalisation

### 6.1 Consent Architecture

```
User arrives → Show consent notice (Rule 3) in EN/HI/GU
  ├── Purpose 1: Account creation [Accept / Decline]
  ├── Purpose 2: Property alerts [Accept / Decline]
  ├── Purpose 3: Marketing communications [Accept / Decline]
  └── Purpose 4: Analytics/improvement [Accept / Decline]

Consent stored: { userId, purpose, version, timestamp, ipAddress, method }
Withdrawal: User can withdraw per-purpose at any time → triggers erasure cascade
```

### 6.2 Data Retention Schedule

| Data Type | Retention | Basis |
|-----------|-----------|-------|
| Active user account | Duration + 6 months | Contractual |
| Inactive account | 3 years from last login → erasure | DPDP Rule 8 |
| Enquiry / lead data | 2 years | Business purpose |
| Payment records | 8 years | GST/Income Tax |
| Security / audit logs | 1 year | DPDP + CERT-In |
| KYC documents | 5 years from account closure | PMLA |
| Marketing consent records | Duration of consent + 3 years | Legal evidence |

### 6.3 Data Principal Rights (Self-Service — 90-day SLA)

| Right | UI Location | Backend Action |
|-------|------------|----------------|
| Access | Settings → My Data → Download | Generate JSON/PDF export |
| Correction | Settings → Edit Profile | Update with audit trail |
| Erasure | Settings → Delete Account | 48h notice → hard delete |
| Withdraw consent | Settings → Privacy | Per-purpose revocation |
| Grievance | Help → Contact DPO | Route to privacy@propunified.in |

### 6.4 DPIA Triggers

Conduct a Data Protection Impact Assessment before:
- Aadhaar/biometric KYC integration
- Behavioural profiling for personalisation
- AI-powered valuation using user data
- Cross-platform data sharing with analytics vendors
- Any feature that may affect children

---

## 7. Security Governance Structure

### 7.1 Roles

| Role | Responsibilities |
|------|-----------------|
| DPO / Privacy Lead | DPDP compliance; RoPA; privacy notices; data principal rights; regulatory liaison |
| CISO / Security Lead | Security strategy; risk register; incident authority; pen test programme |
| Grievance Officer (India-resident, named) | IT Rules + Consumer Protection compliance; complaint resolution (7 days) |
| Incident Commander (on-call rotation) | Leads incident response; CERT-In / DPB notification authority |
| Security Champions (per team) | Secure coding review; security checklist enforcement in sprints |

### 7.2 Governance Cadence

| Meeting | Frequency | Purpose |
|---------|-----------|---------|
| Security Review | Monthly | Vulnerabilities, open findings, upcoming changes |
| Risk Review | Quarterly | Risk register update, regulatory changes |
| Tabletop Exercise | Quarterly | Simulate incident; test CERT-In 6h clock |
| Penetration Test Review | Annual | Finding prioritisation and remediation |
| Compliance Audit | Annual | ISO 27001 + DPDP self-assessment |

---

## 8. Compliance Roadmap

### Sprint 0 — This Week (Critical Code Fixes)
See SECURITY_ARCHITECTURE.md Section 16 for exact day-by-day tasks.

Summary:
- Fix CORS wildcard → explicit allowlist
- Add auth to all write endpoints
- Add ownership checks to listing endpoints (BOLA)
- Remove ownerPhone from public API response
- Field-encrypt PAN/Aadhaar

### Phase 1 — 1–3 Months (Legal & Privacy Foundations)
- Appoint DPO; engage data-protection legal counsel
- Consent notice published (EN/HI/GU)
- Consent capture + versioning system
- Data Principal rights self-service portal
- Centralised audit log + SIEM
- Breach response playbook (see INCIDENT_RESPONSE_RUNBOOK.md)
- Vendor DPAs signed
- DLT registration for SMS

### Phase 2 — 3–9 Months (Security Maturity)
- ISO 27001:2022 implementation
- Annual penetration test
- Automated data retention/erasure jobs
- Proxy phone number masking (Exotel)
- RERA QR code generation on listings
- Mobile MASVS v2 hardening
- SIEM alert rules tuned

### Phase 3 — 9–18 Months (Full Compliance)
- ISO 27701 implementation
- Full DPDP operational compliance before **13 May 2027**
- SOC 2 readiness
- Accessibility audit (WCAG 2.2 AA)
- FEMA / RBI review if NRI volumes grow
- SDF designation monitoring

---

## 9. Audit & Assurance Programme

| Activity | Frequency | Provider |
|----------|-----------|---------|
| Internal security review | Monthly | Security lead |
| Privilege access review | Quarterly | CISO |
| Penetration test | Annual | CERT-In empanelled firm |
| ISO 27001 surveillance | Annual | NABCB accredited body |
| PCI DSS SAQ A | Annual | Internal (self-assessed) |
| Tabletop exercise | Quarterly | On-call team |
| Bug bounty | Ongoing | HackerOne / private |

---

## 10. Master Compliance Checklist

### Data Protection & Privacy
- [ ] DPDP Data Fiduciary obligations mapped; legal basis per processing activity documented
- [ ] DPO / Privacy Lead appointed
- [ ] Consent notice in English, Hindi, and Gujarati published
- [ ] Consent capture + versioning + immutable records
- [ ] Per-purpose consent withdrawal flow
- [ ] Data Principal self-service rights portal (access / correct / erase)
- [ ] Grievance mechanism (7-day resolution)
- [ ] Record of Processing Activities (RoPA) — see DATA_FLOW_REGISTER.md
- [ ] DPIAs completed for high-risk processing activities
- [ ] DPDP Rule 6 seven safeguards implemented and evidenced
- [ ] Breach playbook — see INCIDENT_RESPONSE_RUNBOOK.md
- [ ] Automated erasure jobs + 48h pre-erasure notice
- [ ] All data in India region (no cross-border transfers)
- [ ] Vendor DPAs with DPDP flow-down clauses
- [ ] Children's data: age gating or verifiable parental consent
- [ ] Aadhaar Data Vault if Aadhaar numbers stored

### Cybersecurity
- [ ] CERT-In 6-hour breach notification capability tested
- [ ] Log retention: 1 year, 180 days in India minimum
- [ ] NTP sync to NPL/NPLI servers
- [ ] ISO 27001:2022 certification in progress
- [ ] Annual pen test by CERT-In empanelled firm
- [ ] OWASP ASVS v4 and API Security Top 10 addressed
- [ ] OWASP MASVS v2 compliance for React Native app
- [ ] Vulnerability management programme with remediation SLAs

### Real Estate / RERA
- [ ] RERA number displayed on all new project listings
- [ ] GujRERA QR code on all listing pages and advertisements
- [ ] Agent RERA registration captured and displayed
- [ ] GujRERA API verification on listing create
- [ ] No misleading advertising claims
- [ ] Developer quarterly update data from GujRERA

### Payments
- [ ] Razorpay merchant KYC completed
- [ ] Hosted checkout only — SAQ A scope maintained
- [ ] Webhook HMAC signature verification
- [ ] Server-side payment verification before order fulfilment
- [ ] No raw card data stored
- [ ] Razorpay tokenisation for saved cards
- [ ] PCI DSS SAQ A self-assessment annually
- [ ] CSP blocking non-Razorpay scripts on payment pages

### Telecom
- [ ] DLT Principal Entity registration
- [ ] All sender IDs registered
- [ ] All SMS templates registered before use
- [ ] All SMS URLs whitelisted on DLT
- [ ] DND compliance check before all commercial communications
- [ ] WhatsApp opt-in captured; template-only messages

### Consumer Protection
- [ ] Legal name, CIN, GSTIN displayed on platform
- [ ] Named Grievance Officer and contact published
- [ ] 48-hour complaint acknowledgement; 1-month resolution
- [ ] Seller/agent verification and undertaking
- [ ] Sponsored listings labelled
- [ ] Refund/cancellation policy published

### Tax
- [ ] GST registered; GSTIN displayed
- [ ] 18% GST on platform fees; monthly returns filed
- [ ] 1% GST TCS if marketplace model (GSTR-8)
- [ ] 0.1% Section 194O TDS on payouts (Form 26Q quarterly)
- [ ] 194-IA buyer TDS information displayed (≥₹50L transactions)
- [ ] Payment records retained 8 years

### IT Law / Intermediary
- [ ] Terms of Service with IP licence grant published
- [ ] Privacy Policy (DPDP-compliant) published
- [ ] IT Rules 2026: 3-hour takedown capability
- [ ] Grievance resolution: 7 days
- [ ] AI-generated content labelled with disclosure and metadata
- [ ] Safe harbour due diligence maintained

### Governance
- [ ] Named DPO / Privacy Lead
- [ ] Named CISO / Security Lead
- [ ] Named Grievance Officer (India-resident)
- [ ] Security governance cadence established
- [ ] Risk register maintained — see RISK_REGISTER.md
- [ ] Staff security awareness training (quarterly)
- [ ] Vendor risk assessment programme
- [ ] Bug bounty / responsible disclosure policy

---

## 11. Key Regulatory Contacts

| Authority | Contact | Purpose |
|-----------|---------|---------|
| CERT-In | incident@cert-in.org.in | Mandatory breach reporting (6 hours) |
| Data Protection Board of India | dpb.gov.in (post-appointment) | DPDP breach reports |
| GujRERA | gujrera.gujarat.gov.in | RERA verification, complaints |
| TRAI / DLT Portal | trai.gov.in | DLT registration, DND |
| FIU-IND | fiu.gov.in | AML/STR if applicable |
| RBI | rbi.org.in | Payment system queries |
| CCI | cci.gov.in | Competition law queries |
| Consumer Forum | consumerhelpline.gov.in | Consumer complaints |

---

*This is a technical and operational guide, not legal advice. Validate DPDP thresholds, RERA specifics, and any SDF designation with qualified Indian legal counsel before launch.*

*See SECURITY_ARCHITECTURE.md for implementation details and code patterns.*  
*See INCIDENT_RESPONSE_RUNBOOK.md for breach response procedures and notification templates.*  
*See DATA_FLOW_REGISTER.md for the complete Record of Processing Activities.*  
*See RISK_REGISTER.md for the current risk inventory.*
