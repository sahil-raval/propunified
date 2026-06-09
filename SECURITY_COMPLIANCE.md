# PROP UNIFIED — Security, Governance, Risk & Compliance (SGRC) Master Reference

**Scope:** Indian real estate marketplace, Gujarat/Ahmedabad focus  
**Stack:** Next.js / React Native · Vercel · Render · Supabase (Postgres) · Cloudflare · Razorpay  
**Prepared:** June 2026  
**Classification:** Internal — Security & Compliance Team

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
3. [Comprehensive Threat Model](#3-comprehensive-threat-model)
4. [Security Architecture — 8-Layer Defense in Depth](#4-security-architecture--8-layer-defense-in-depth)
5. [Data Governance & Classification](#5-data-governance--classification)
6. [Identity, Authentication & Access Management](#6-identity-authentication--access-management)
7. [Application Security Controls](#7-application-security-controls)
8. [Infrastructure & Cloud Security](#8-infrastructure--cloud-security)
9. [Payment Security](#9-payment-security)
10. [Mobile Application Security](#10-mobile-application-security)
11. [Operational Security & Monitoring](#11-operational-security--monitoring)
12. [Incident Response & Breach Management](#12-incident-response--breach-management)
13. [Third-Party & Supply Chain Risk](#13-third-party--supply-chain-risk)
14. [Privacy Engineering & DPDP Operationalisation](#14-privacy-engineering--dpdp-operationalisation)
15. [Security Governance Structure](#15-security-governance-structure)
16. [Compliance Roadmap & Implementation Timeline](#16-compliance-roadmap--implementation-timeline)
17. [Audit & Assurance Programme](#17-audit--assurance-programme)
18. [Master Compliance Checklist](#18-master-compliance-checklist)

---

## 1. Executive Summary

PROP UNIFIED is a digital marketplace facilitating real estate transactions in India. As an operator of a platform that collects, processes, and stores the personal data of Indian citizens, handles financial information, mediates property transactions, and serves as a communications channel between buyers, sellers, agents, and builders — you are subject to a complex, multi-layered regulatory environment.

This document maps applicable law, regulation, standard, and guideline you must comply with, and proposes the security architecture, governance structures, and operational controls needed to achieve and maintain compliance.

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

**Status:** Rules notified 13–14 November 2025. Phased enforcement; full compliance deadline **13 May 2027**.

**Your classification:** You are a **Data Fiduciary** (you determine the purpose and means of processing). Supabase, Vercel, Render, Razorpay, SMS/WhatsApp vendors are **Data Processors**.

**Role of your users as Data Principals:** Buyers, sellers, agents, builders who interact with the platform.

**Applicability thresholds:** The Act applies to processing of digital personal data. All your user data — phone numbers, emails, property preferences, enquiry history, payment data — qualifies.

**Significant Data Fiduciary (SDF) Risk:** If the Central Government designates your platform as an SDF (based on volume of data, sensitivity, or national security considerations), additional obligations apply including annual Data Protection Impact Assessment (DPIA), independent audit, mandatory Data Protection Officer resident in India, and algorithmic transparency assessment. Build toward SDF readiness from the start.

**Phased Implementation Timeline:**

| Milestone | Date |
|-----------|------|
| Rules notified | 13–14 Nov 2025 |
| Data Protection Board constituted | Jan 2026 (est.) |
| Consent Manager registration window | By 13 Nov 2026 |
| Full substantive obligations (Rules 3, 5–16, 22, 23) | **13 May 2027** |

**Your obligations under each Rule:**

**Rule 3 — Consent Notice:** Provide itemised, plain-language notice before collecting data. Must state: (a) personal data being collected, (b) purpose of processing, (c) how to exercise rights, (d) how to withdraw consent. One notice per processing purpose. Must be available in **English, Hindi, and Gujarati** for your market.

**Rule 4 — Consent Mechanism:** Consent must be a clear, affirmative, specific, informed, free act. No pre-ticked boxes. No bundled consent for multiple purposes. Maintain timestamped consent records with the version of the notice shown.

**Rule 5 — Deemed Consent:** Certain processing does not require explicit consent (e.g., processing clearly necessary to perform a service the user has requested, compliance with law, protection of life). Document where you rely on deemed consent.

**Rule 6 — Security Safeguards (THE SEVEN MANDATORY CONTROLS):**

| # | Statutory Requirement | Your Implementation |
|---|----------------------|---------------------|
| 1 | Encryption in storage and transit | TLS 1.3 + AES-256 at rest (Supabase SSE + S3 KMS) |
| 2 | Access controls proportionate to risk | RBAC + Supabase Row Level Security + IAM least privilege |
| 3 | Data masking / anonymisation | Mask phone/email in API responses and logs; pseudonymise analytics |
| 4 | Monitoring of access and processing | Centralised audit log of every PII access event |
| 5 | Log retention ≥ 1 year | Immutable log store (S3 + CloudWatch Logs, 12-month retention) |
| 6 | Incident response capability | Documented playbook, tabletop drills, on-call rota |
| 7 | Backup and business continuity | Automated encrypted backups, tested restores, RTO/RPO documented |

**Rule 7 — Breach Notification:**  
Two mandatory clocks start the moment you become *aware* of a breach (not when investigation completes):
- **Data Protection Board:** Notify "without delay"; file full report within **72 hours** covering: description of breach, categories and volume of data principals affected, likely consequences, measures taken to address the breach.
- **Affected Data Principals:** Notify "without delay" in plain language: what happened, what data was involved, what they should do, your contact details.

**Rule 8 — Retention & Erasure:**
- Erase personal data once the purpose for collection is served, consent is withdrawn, or the user goes inactive.
- **Three-year inactivity deletion rule** applies to classes listed in the Third Schedule (verify with counsel whether real estate user data falls here).
- Give users **48 hours advance notice** before erasure so they can re-engage.
- Implement automated deletion jobs with audit trails.

**Data Principal Rights (respond within 90 days; build self-service):**
- Right to access a summary of personal data
- Right to correction and completion
- Right to erasure
- Right to grievance redressal
- Right to nominate a successor

**Children's data:** Anyone under 18 requires verifiable parental consent. Targeted advertising and behavioural monitoring of minors is prohibited. If minors can register, deploy age verification.

**Processor obligations (flow-down):** Each Data Processor contract must require the processor to (a) implement the same seven security safeguards, (b) notify you of any breach without delay, (c) process data only on your documented instructions, (d) delete or return data on contract termination, (e) allow audits.

**Cross-border transfers:** Transfers of personal data outside India require either (a) adequate protection determination by the Central Government for the recipient country/sector, or (b) specific contractual safeguards. For now, keep data residency pinned to India (Supabase Mumbai / AWS ap-south-1) to avoid this obligation entirely.

---

#### B. IT Act 2000 — Section 43A + Sensitive Personal Data or Information (SPDI) Rules

Although largely subsumed by DPDP, SPDI Rules still define **Sensitive Personal Data** in India:
- Passwords
- Financial information (bank account, card numbers, credit/debit details)
- Physical, physiological, and mental health data
- Sexual orientation
- Medical records
- Biometric data

For a real estate platform: financial information and biometric/Aadhaar data if you do eKYC are SPDI. Body corporates handling SPDI must maintain **reasonable security practices** — ISO 27001 or a documented security programme is the safe harbour.

---

#### C. Aadhaar Act 2016 + UIDAI Authentication Guidelines

If you implement Aadhaar-based eKYC for agent or user verification:
- You must obtain **UIDAI authentication licence** — Aadhaar authentication is not available to all entities, only licensed Authentication User Agencies (AUAs) and e-KYC User Agencies (KUAs).
- **Never store the Aadhaar number** in plain text. Use a UIDAI-compliant **Aadhaar Data Vault** with field-level tokenisation.
- Biometric data (fingerprint, iris) captured for authentication **must not be stored** on any persistent database.
- OTP-based eKYC data (VID, response XML) must be encrypted and cannot be shared.
- You cannot use Aadhaar for authentication purposes beyond what UIDAI authorises. For a marketplace, the recommended approach is **Offline/Paperless eKYC** (QR-code based, no UIDAI server ping required) or **DigiLocker** integration for document sharing.
- Aadhaar authentication logs must be maintained as per UIDAI directions.

**Practical recommendation:** Use Aadhaar eKYC only for agent/builder RERA registration verification, not for general user onboarding. For buyers/owners, phone OTP + PAN verification is lower regulatory burden.

---

### 2.2 Cybersecurity Legislation & Directions

#### A. Information Technology Act 2000 — Cybersecurity Offences

| Section | Relevance |
|---------|-----------|
| §43 | Civil liability for unauthorised access, damage, data theft — you are liable if your platform enables this through negligence |
| §43A | Body corporates must maintain reasonable security practices for SPDI; negligent handling → compensation to affected persons |
| §65 | Tampering with computer source code — relevant to your codebase integrity |
| §66 | Computer-related offences (hacking) — obligation to report |
| §66A | (Struck down but replacement provisions in Digital India Act expected) |
| §66B–66F | Receiving stolen computer resources, identity theft, cheating by personation, violation of privacy, cyber terrorism |
| §67A | Publishing sexually explicit material — content moderation obligation |
| §69 | Government interception/decryption powers — you must technically enable lawful interception if directed |
| §70B | CERT-In powers — you must respond to CERT-In directions within stated timelines |
| §72A | Breach of confidentiality and privacy by intermediaries |
| §79 | Safe harbour for intermediaries — see Section 2.11 |

#### B. CERT-In Directions 2022 (Active)

**Mandatory reporting within 6 hours** of awareness for these 20 incident categories:
1. Targeted scanning/probing of critical networks/systems
2. Compromise of critical systems/information
3. Unauthorised access to IT systems/data
4. Defacement of website or intrusion
5. Malicious code attacks (virus, worm, trojan, ransomware, spyware, cryptominers)
6. Attacks on servers and network infrastructure
7. Identity theft, spoofing, phishing attacks
8. Denial of Service and Distributed Denial of Service attacks
9. Attacks on critical infrastructure
10. Attacks on Internet of Things devices
11. Attacks on data and database
12. Attacks on e-governance or e-commerce applications **(you are in scope)**
13. Supply chain attacks
14. Attacks on digital payment systems **(you are in scope)**
15. Data breach
16. Data leakage
17. Attacks on critical information infrastructure
18. Vulnerabilities in critical information infrastructure
19. Attacks on cloud infrastructure
20. Attacks on mobile infrastructure

**Other CERT-In obligations:**
- **Log retention: 180 days within India** (separate from DPDP's 1-year requirement — your system must meet the higher standard of 1 year to satisfy both)
- **NTP synchronisation:** All ICT infrastructure must sync to NTP (National Physical Laboratory or NPLI servers)
- **KYC maintenance:** VPN and cloud providers must maintain customer KYC records for 5 years
- If you provide VPN access to employees/users: maintain KYC + logs

**CERT-In Cyber Security Audit Guidelines (July 2025):**
CERT-In issued comprehensive audit guidelines that define the lifecycle of security audits from planning through reporting. These are expected to be mandatory for a broader class of organisations. Engage a CERT-In empanelled auditor for annual assessments.

#### C. IT (Intermediary Guidelines and Digital Media Ethics Code) Amendment Rules 2026

**Effective: 20 February 2026.** Your platform qualifies as an **intermediary** under IT Act §2(w) — you provide a computer resource through which third-party content (property listings, user reviews, agent profiles, photos) is transmitted or stored.

**What changed from the 2021 Rules:**

| Area | Previous (2021) | Current (2026 Amendment) |
|------|----------------|--------------------------|
| Takedown timeline | 36 hours | **3 hours** (for lawful government orders) |
| Grievance redressal | 15 days | **7 days** |
| AI/synthetic content | Not addressed | **Mandatory disclosure and labelling** |
| Synthetic content metadata | Not required | Permanent metadata/unique identifier required |

**Your specific obligations under 2026 Rules:**

1. **Publish a Privacy Policy and Terms of Service** — must be accessible, in plain language, state categories of data collected.
2. **Grievance Officer:** Appoint a named, India-resident Grievance Officer. Display name and contact on your platform. Acknowledge complaints within 24 hours; resolve within 7 days.
3. **Safe Harbour maintenance:** To retain safe harbour protection under §79, you must comply with due diligence obligations. Failure to comply = full liability for all third-party content.
4. **AI/Synthetic Content:** If you use AI-generated images, AI-written property descriptions, or AI-generated floor plans, these must be prominently labelled as synthetically generated and embedded with permanent provenance metadata.
5. **Content moderation for unlawful content:** Disable access to unlawful content within 3 hours of receiving a government order (down from 36 hours). Build automated compliance workflows — manual processing cannot meet this SLA.
6. **First originator tracing:** If designated as a Significant Social Media Intermediary (SSMI — threshold: 5 million registered users in India), you must enable tracing of the first originator of harmful content. This is not immediately applicable but plan your architecture to support message provenance without breaking end-to-end encryption.

**Significant Social Media Intermediary threshold:** 5 million registered users. When you approach this, additional obligations activate: Chief Compliance Officer (India-resident), Nodal Contact Person (India-resident, 24×7 availability for law enforcement), Resident Grievance Officer, monthly compliance reports.

---

### 2.3 Sector-Specific Real Estate Regulations

#### A. Real Estate (Regulation and Development) Act 2016 + GujRERA

**This is your most operationally immediate compliance obligation.** GujRERA applies to all new real estate projects and agents in Gujarat.

**Obligations for your platform as an aggregator/portal:**

1. **RERA number display mandate:** Every new project listed on your platform must display its GujRERA registration number. Advertising or facilitating bookings for an unregistered project (>500 sq.m. land or >8 apartments) is **illegal**.

2. **QR Code mandate (Active since 15 June 2025):** Every project listing, brochure, digital advertisement must include a scannable QR code linking to the GujRERA project page, the project's RERA number, and the gujrera.gujarat.gov.in website link. This applies to all promotional digital content you publish.

3. **Agent RERA registration:** Under RERA §9, every real estate agent (broker, dealer, aggregator) facilitating transactions in RERA-registered projects must register with GujRERA. If your platform facilitates agent-led transactions, capture and display agent RERA registration numbers. Do not publish listings from unregistered agents for RERA-required projects.

4. **Disclosure requirements on project pages:**
   - RERA registration number and validity date
   - Developer name, PAN, registered address
   - Project layout and specifications as approved by RERA
   - Land title documents (whether clear title, encumbrances)
   - Structural defects liability period
   - Project completion timeline and current progress (updated quarterly by developer)
   - Escrow account details (70% of buyer collections in dedicated account)
   - Legal cases/complaints filed against the developer

5. **No misleading advertising:** GujRERA penalises platforms that display claims about amenities, sizes, or approvals that are not documented. Build content review for new listings before they go live.

6. **Quarterly progress updates:** Developers must update project progress on GujRERA quarterly. Your platform should pull and display this live data via the GujRERA API (or display the date of last update).

7. **Resale / secondary market properties:** RERA primarily applies to new projects from developers. Resale listings (individual seller to buyer) are governed by Transfer of Property Act, Stamp Act, and general RERA provisions for registered agents, but do not require the new project RERA number. However, you should still verify and display the original project's RERA number for informational purposes.

8. **Complaint resolution:** GujRERA has an online complaint portal. Any buyer complaints about listed properties may be directed to RERA adjudication. Your platform's complaint mechanism should capture and route RERA-related complaints.

**Penalties for non-compliance:**
- Developer: Up to 5% of project cost for RERA violations; up to 10% or 3 years imprisonment for ongoing violation
- Agent: ₹10,000/day fine for advertising without RERA number; up to 5% of cost of property sold
- Platform: Treated as co-facilitator of the violation — joint and several liability possible

#### B. Transfer of Property Act 1882

Relevant to your platform for: defining valid property transfer mechanisms (sale deed, lease deed, mortgage), informing what documents your platform should require sellers to upload, understanding title chain verification.

#### C. Registration Act 1908 + Indian Stamp Act 1899 / Gujarat Stamp Act

**Key compliance for your financial tools and information display:**
- All property sales must be registered with the Sub-Registrar's office and stamp duty paid
- Gujarat stamp duty: **4.9%** for most property transactions (higher of Jantri/market value or transaction value)
- Registration charges: **1%** (waived for women buyers — display this prominently)
- Agricultural land: **3%** stamp duty
- Penalty for delayed payment: 2% monthly or up to 200% of deficit duty
- Your stamp duty calculators must be accurate, reflect the Jantri rate floor, and include the female buyer discount
- E-stamping via GARVI portal is now available — link to it from your calculators

#### D. The Registration (Amendment) Rules (State-level)

Gujarat has moved toward e-registration for certain deed types. Your platform can integrate with the GARVI portal for stamp duty calculation and e-stamping links.

---

### 2.4 Payment & Financial Regulations

#### A. RBI Master Direction on Payment Aggregators (September 2025)

This supersedes all prior RBI circulars on payment aggregators (PA). Applies to Razorpay (your PA) and shapes your obligations as a merchant on their platform.

**Razorpay's obligations that affect you:**
- Razorpay must maintain PCI DSS Level 1 certification (annual on-site QSA assessment + quarterly vulnerability scans)
- Merchant KYC: All merchants (you) must complete full KYC with Razorpay. If not completed by 31 December 2025, Razorpay must restrict your services from 1 January 2026
- Razorpay must maintain your funds in an escrow account with a Scheduled Commercial Bank
- Razorpay must perform merchant due diligence — including reviewing your platform's compliance posture

**Your obligations as a merchant:**
- Maintain your own PCI DSS compliance in scope (SAQ A if you use hosted checkout only)
- Provide accurate business information, PAN, GSTIN, and bank account details to Razorpay
- Maintain payment records for audit
- Do not circumvent Razorpay's fraud controls

**PA-Online (PA-O) classification:** Razorpay is a PA-O; your integration is a standard merchant integration. You are not required to be licensed as a PA unless you start intermediating payments between third parties yourself (e.g., collecting booking fees from buyers and holding/disbursing to agents).

**If you implement booking deposits / advance payments:**
- This may trigger PA licensing requirements for you if you hold and disburse funds
- Strong legal advice required before implementing escrow-like payment holding
- Alternative: use Razorpay's escrow or split payment features so you never hold funds

#### B. PCI DSS v4.0.1 (Mandatory since 31 March 2025)

All 51 future-dated requirements from v4.0 are now mandatory as of 31 March 2025.

**Your compliance scope:**

| Scenario | PCI DSS Scope | SAQ Type | Effort |
|----------|--------------|----------|--------|
| Razorpay hosted checkout, your page has NO JS touching payment form | **SAQ A** | 22 questions | Low |
| Your page loads Razorpay.js but card fields are iframed | **SAQ A-EP** | ~190 questions | Medium |
| Any card data touches your server | **SAQ D** | 350+ questions | Very high |

**Stay in SAQ A by:**
- Using Razorpay's redirect checkout or payment links only
- Ensuring no JavaScript on your pages can read, intercept, or modify the payment iframe
- Implementing a strict **Content Security Policy** on your checkout pages

**New PCI DSS v4.0 Requirements applicable even to SAQ A merchants:**
- **Requirement 6.4.3:** Maintain an inventory of all scripts that execute in the consumer browser on the payment page; written justification for each; integrity controls (SRI)
- **Requirement 11.6.1:** Deploy a mechanism to detect unauthorised changes to HTTP headers and script contents in the consumer browser on the payment page — implement CSP reporting to a trusted endpoint

**Practical action:** Add `report-uri` or `report-to` to your CSP header so any script injection or modification is flagged immediately.

#### C. RBI Tokenisation Mandate

- Raw card data must never be stored by you
- Use Razorpay's tokenisation for saved cards (compliant with RBI card-on-file mandate)
- The token, not the card number, is what you store in your database

#### D. RBI Two-Factor Authentication (2FA) for CNP Transactions

Razorpay / issuing banks handle this (OTP or authentication app). Design your checkout to not bypass Razorpay's authentication challenge.

#### E. RBI Digital Payments Security Guidelines

For any future UPI / NACH / mandate integrations:
- Follow UPI Circular on security controls for UPI-enabled apps
- For recurring mandates (subscription plans, EMI), comply with e-NACH/NACH mandate framework

#### F. SEBI Regulations (Future-scoped)

If you ever enable fractional investment, real estate tokens, or REITs on your platform, SEBI's framework applies. India's Asset Tokenisation Bill 2026 is under discussion — monitor this if you plan investment features.

---

### 2.5 Telecom & Communication Regulations

#### A. TRAI Telecom Commercial Communications Customer Preference Regulations (TCCCPR) 2018 + 2025 Amendments

**Most critical:** All commercial SMS/call communications require DLT (Distributed Ledger Technology) registration.

**Your obligations:**

1. **Register as a Principal Entity (PE)** on the DLT platform of your chosen telecom operator (Airtel, Jio, BSNL, Vodafone Idea)
2. **Register all Header/Sender IDs** before any SMS is sent (e.g., PROPFY, GHRKHO)
3. **Register all SMS templates** before use. Categories:
   - Transactional (OTP, account notifications) — highest priority, lowest block risk
   - Service (property alerts, saved search matches) — must have implicit consent
   - Promotional (new listings, marketing) — requires explicit DNC compliance
4. **URL whitelisting (Active since 1 October 2024):** Every URL in any SMS must be pre-registered and whitelisted on the DLT portal for your sender ID. Shortened URLs pointing to unregistered domains are blocked. Register your domain and all redirect domains.
5. **Real estate is Category 2 commercial communication.** Users can opt out of all real estate communications via DND. Your system must honour DND preferences before sending.
6. **Complaint threshold:** 5 complaints in 10 days triggers enforcement action (reduced from 10 in 7 days by 2025 amendment)
7. **Action timeline:** Operators must act on complaints within 5 days (reduced from 30 days)

**WhatsApp Business API:**
- Register with a WhatsApp Business Solution Provider (BSP)
- All template messages must be approved by Meta before sending
- Users must opt in to receive WhatsApp messages — capture and store opt-in with timestamp
- Honour opt-out requests immediately
- Use only approved message templates for transactional flows (OTP, enquiry confirmation, etc.)

**Voice / IVR Calls:**
- Outbound marketing calls require DND compliance check
- Store consent proof for every promotional call campaign
- Time restrictions: no promotional calls before 9 AM or after 9 PM (TRAI TCCCPR)

#### B. Telecom Act 2023

India's new Telecom Act replaces TRAI Act provisions. Monitor implementing rules for impact on OTP, CLI, and SIM-swap fraud prevention that affects your auth flows.

---

### 2.6 Consumer Protection & E-Commerce Rules

#### A. Consumer Protection Act 2019 + Consumer Protection (E-Commerce) Rules 2020

Your platform is an e-commerce entity within the meaning of these rules.

**Mandatory disclosures on your platform:**
- Legal name of entity
- Registered office address and corporate identity number (CIN)
- Contact details: email, phone/helpdesk, WhatsApp
- GST Identification Number (GSTIN)
- Fax (if any)
- Name and contact of Grievance Officer
- Names and details of sellers/agents listed on platform

**Grievance redressal:**
- Acknowledge complaints within **48 hours**
- Resolve within **1 month**
- Grievance Officer must be a named individual, not a generic contact

**Seller/agent verification obligations:**
- Obtain undertaking from sellers/agents that their listings are accurate and lawful
- Maintain records of sellers and their provided information
- Remove sellers found to be fraudulent or repeatedly non-compliant

**Consent obligations:**
- Do not use pre-ticked checkboxes for consent
- Do not record consent automatically
- Obtain explicit affirmative consent before subscribing users to newsletters/alerts

**Fair listing practices:**
- No manipulation of search rankings in exchange for undisclosed payment
- If featured/sponsored listings are paid, they must be clearly labelled "Sponsored" or "Ad"
- No fake reviews or rating manipulation (agent/builder star ratings must be genuine)

**Cancellation and refund policy:**
- If you charge listing fees, subscription fees, or boost fees: publish a clear refund/cancellation policy
- Honour refund commitments within the stated timeline

#### B. Legal Metrology (Packaged Commodities) Rules

Not directly applicable to real estate listings, but if you sell any physical products through the platform, packaged commodity labelling rules apply.

#### C. Advertising Standards Council of India (ASCI) Code

While voluntary, ASCI's code is cited in consumer protection enforcement. Key rules:
- All property advertisements must be truthful and not misleading
- RERA registration number is mandatory in property ads (aligns with GujRERA)
- No superlatives ("best", "No. 1") without substantiation
- Comparative advertising must be fair and verifiable

---

### 2.7 Anti-Money Laundering & KYC Obligations

#### A. Prevention of Money Laundering Act (PMLA) 2002

Real estate is a high-risk sector for money laundering in India. While PMLA's AML obligations currently apply formally to financial institutions, insurance companies, and securities market intermediaries, **real estate agents and portals are increasingly in regulatory scope**.

**Current obligation level for real estate portals:**
- Not yet formally designated as "reporting entities" under PMLA (as of mid-2026)
- However, if you facilitate financial transactions (booking deposits, platform payments) you are de facto at risk
- Watch for FATF recommendations and Enforcement Directorate guidance — real estate platforms are on the radar

**What to implement proactively:**
1. **KYC for high-value transaction participants:** For transactions above ₹50 lakh, encourage (and document) buyer and seller identity verification
2. **Suspicious transaction pattern monitoring:** Large cash payment claims, property flipping at unusual prices, NRI/foreign buyer unusual patterns
3. **PEP screening:** Politically Exposed Person screening for high-value accounts
4. **Document retention:** Keep KYC documents and transaction records for 5 years

**If you enable booking deposits or payment escrow in future:**
- You will very likely be classified as a reporting entity under PMLA
- Mandatory: KYC compliance, STR filing with Financial Intelligence Unit India (FIU-IND), record-keeping

#### B. Foreign Contribution (Regulation) Act (FCRA) 2010

Not directly applicable unless you accept foreign funding for specific "political" activities. Monitor if foreign investors/funds participate in your platform.

---

### 2.8 Tax Compliance Obligations

#### A. GST (Goods and Services Tax)

| Transaction Type | GST Rate | Your Obligation |
|-----------------|----------|-----------------|
| Under-construction residential property | 5% (no ITC) | Display GST on listing; inform buyers |
| Affordable housing (under-construction) | 1% | Differentiate in listing labels |
| Ready-to-move-in property | 0% (exempt) | Label clearly; stamp duty applies |
| Commercial property (under-construction) | 12% | Display on commercial listings |
| Platform subscription fees (agents/builders) | 18% | Charge GST on your subscription plans; file returns |
| Lead generation fees | 18% | Collect GST; issue tax invoice |
| Listing / featured placement fees | 18% | Collect GST; issue tax invoice |

**Obligations:**
- Register for GST if your annual revenue exceeds ₹20 lakh (₹10 lakh for some states)
- Obtain GSTIN and display on your platform
- File GSTR-1 (monthly/quarterly outward supplies), GSTR-3B (monthly summary)
- Maintain B2B transaction records with buyer GSTIN for input tax credit eligibility
- Issue GST-compliant tax invoices for all B2B transactions

**GST TCS (Tax Collected at Source) under Section 52, CGST Act:**
If you are a marketplace operator collecting payment on behalf of sellers/agents:
- Deduct **1% TCS** on net taxable value of all supplies facilitated
- File TCS return (GSTR-8) monthly
- Issue TCS certificate to sellers/agents for input credit

#### B. Income Tax — Section 194O (TDS on E-Commerce)

As an e-commerce operator facilitating transactions:
- **Deduct TDS at 0.1%** of gross sales proceeds when payment is made or credited to an e-commerce participant (agent/builder), whichever is earlier
- File **Form 26Q** quarterly with Income Tax Department
- Issue **Form 16A** (TDS certificate) to participants annually
- **Exemption:** E-commerce participants with gross sales below ₹5 lakh in the year AND who have furnished PAN/Aadhaar — document this exemption

**TDS on property purchase (§194-IA):**
For any transactions where your platform assists in completing a property purchase:
- Buyer must deduct 1% TDS on purchase price (if property value ≥ ₹50 lakh)
- Inform buyers of this obligation prominently on your platform
- This is the buyer's obligation, but failing to inform users of a legal obligation creates platform liability

#### C. Income Tax — Section 194N (TDS on Cash Withdrawals)

If your platform accumulates vendor/agent payouts in a wallet, withdrawals above thresholds are subject to TDS. Keep payout architecture clean.

#### D. Equalisation Levy

If you earn revenue from advertising services provided to non-residents (foreign property buyers seeing promoted listings), the **6% Equalisation Levy** may apply. As you scale internationally (NRI audience), track this.

---

### 2.9 Foreign Exchange & NRI Compliance

#### A. Foreign Exchange Management Act (FEMA) 1999

Highly relevant given your Ahmedabad/Gujarat market — large NRI/PIO community.

**NRI property investment rules you must surface to users:**
- NRIs can purchase residential and commercial property (unlimited numbers)
- NRIs **cannot** purchase agricultural land, farmhouse, or plantation property without RBI approval
- Payment must be from NRE/NRO bank account or inward remittance — not foreign currency cash
- Repatriation: up to 2 residential properties' sale proceeds can be repatriated; beyond that, only via NRO account (USD 1 million/year limit)

**Platform compliance obligations:**
- Display FEMA restrictions clearly on property listing pages for NRI-designated properties
- For international users, add disclaimers about FEMA restrictions
- If you collect payments from NRIs, work with Razorpay to ensure payment route compliance (NRE/NRO, SWIFT)
- Do not facilitate transactions that would violate FEMA (agricultural land to NRI without RBI approval)

#### B. Foreign Direct Investment (FDI) Policy — Real Estate

For your platform itself (if you raise foreign venture capital):
- FDI in "construction-development projects" is allowed under automatic route (up to 100%)
- FDI in "real estate business" (buying/selling completed property) is **prohibited**
- Your platform is a technology services company, not a real estate business — structure and document this carefully for FDI eligibility
- Every foreign investment received must be reported to RBI via FIRMS portal within 30 days

---

### 2.10 Competition & Antitrust Law

#### A. Competition Act 2002 + Competition Amendment Act 2023

As you scale, Competition Commission of India (CCI) oversight becomes relevant.

**Areas of concern for real estate platforms:**
1. **Abuse of dominance:** If you achieve a dominant position in the Ahmedabad/Gujarat online real estate market, practices like exclusive listing agreements, predatory pricing, or denial of access to the platform could be scrutinised
2. **Anti-competitive agreements:** Agreements with builders/developers to exclusively list on your platform, or price-fixing arrangements with agents
3. **Data-driven market power:** The 2023 amendment strengthens CCI's powers over digital markets and "killer acquisitions" — large data sets can be evidence of market power
4. **Digital Market Concentration:** CCI issued detailed guidelines on digital markets in 2024-25; platforms with network effects are monitored proactively

**Safe practices:**
- Avoid exclusive listing agreements
- Ensure subscription/listing fee structures are publicly available and non-discriminatory
- Maintain transparent ranking/search algorithms — document them internally
- Do not engage in predatory pricing designed to eliminate competitors

---

### 2.11 Intellectual Property & Content Law

#### A. Copyright Act 1957

Property photos, floor plans, architectural drawings, and written descriptions are **copyrighted works**. When agents/builders upload content:
- Obtain a **licence/assignment** from them to display, reproduce, and create thumbnails/derivatives
- Your Terms of Service must include an IP licence grant from users to the platform
- Do not republish photos from other property portals without licence
- Watermark your processed images to protect your investment in media

#### B. Trade Marks Act 1999

Register your brand name, logo, and app name as trade marks in Class 36 (real estate) and Class 42 (software/technology services) in India.

#### C. Right to Privacy (Puttaswamy Judgment, 2017)

The Supreme Court's landmark judgment recognises privacy as a fundamental right. This informs the interpretation of DPDP and underpins the regulatory environment. Privacy-by-design is not just a DPDP obligation — it is constitutionally anchored.

---

### 2.12 Accessibility Standards

#### A. Rights of Persons with Disabilities Act 2016 (RPwD Act)

Section 42 of the RPwD Act requires that websites providing services, information, or communication of a public nature must comply with accessibility standards prescribed by the relevant authority. While implementation guidelines for private digital platforms are evolving, this creates a compliance obligation direction.

#### B. Guidelines for Indian Government Websites (GIGW) 3.0

While applicable to government sites, Indian enterprises are expected to align with these as a baseline. The GIGW references **WCAG 2.1 Level AA** as the target standard.

#### C. GuDApps (Guidelines for Developing Accessible Mobile Applications)

Government guidelines for accessible mobile app development in India — relevant for your React Native app.

#### D. WCAG 2.2 Level AA (Target Standard)

| Principle | Key Requirements for Real Estate App |
|-----------|--------------------------------------|
| Perceivable | Alt text for property photos, captions for video tours, sufficient colour contrast (4.5:1 minimum) |
| Operable | All functionality keyboard-accessible, touch targets ≥ 44×44px on mobile, no content that causes seizures |
| Understandable | Error messages that explain how to fix the issue, consistent navigation, form labels |
| Robust | Works with screen readers (VoiceOver, TalkBack), semantic HTML, ARIA labels |

**Priority implementations:**
- Property search: screen reader compatible filter UI
- Map view: keyboard-navigable markers with accessible tooltips
- Contact forms: fully labelled, with descriptive error messages
- Property photos: alt text populated from listing descriptions
- Price information: not conveyed by colour alone

---

### 2.13 International & Voluntary Standards

#### A. ISO/IEC 27001:2022 — Information Security Management System (ISMS)

**The foundational certification to pursue first.** Directly supports DPDP Rule 6 compliance evidence and is the safe harbour under SPDI Rules.

- Transition from 2013 version required by **31 October 2025** (if you had prior cert)
- New controls in 2022 version include: threat intelligence, cloud security, secure coding, data masking, ICT readiness for business continuity, configuration management, physical security monitoring
- Implementation timeline: 3–6 months; certification audit: 1–2 months
- Cost in India: ₹4–12 lakh including consultant + certification body
- Valid for 3 years with annual surveillance audits

**ISO 27001 Annex A controls most critical for your platform:**

| Control | Relevance |
|---------|-----------|
| 5.23 Information security for use of cloud services | Supabase, Vercel, Render |
| 5.30 ICT readiness for business continuity | RTO/RPO planning |
| 7.4 Physical security monitoring | Office/server room |
| 8.9 Configuration management | Infra-as-code, change control |
| 8.10 Information deletion | DPDP Rule 8 erasure |
| 8.11 Data masking | PII protection in logs/analytics |
| 8.12 Data leakage prevention | DLP tools |
| 8.28 Secure coding | SAST/DAST pipeline |
| 8.29 Security testing in development | Pen testing, code review |
| 8.34 Protection of information systems during audit testing | Test data management |

#### B. ISO/IEC 27701:2019 — Privacy Information Management System (PIMS)

An extension to ISO 27001 specifically for privacy / data protection. Maps directly to DPDP obligations. Implement ISO 27001 first, then extend to 27701.

#### C. ISO/IEC 27017:2015 — Cloud Security Controls

Specific controls for cloud service customers (you) and providers (Supabase, Vercel). Relevant given your fully cloud-native architecture.

#### D. ISO/IEC 27018:2019 — Protection of PII in Public Clouds

Standard for cloud processors handling PII. Supabase and Vercel should be compliant; confirm their certifications before signing processor contracts.

#### E. SOC 2 Type II

Attestation report (AICPA standard) covering Security, Availability, Processing Integrity, Confidentiality, and Privacy trust service criteria. Becoming increasingly required by enterprise customers and institutional investors. Consider pursuing after ISO 27001 is in place (overlapping controls reduce effort by ~40%).

#### F. OWASP Standards (Non-negotiable technical baselines)

| Standard | What it addresses |
|----------|-------------------|
| OWASP Top 10 Web (2021) | Web application vulnerabilities |
| OWASP API Security Top 10 (2023) | API vulnerabilities (your primary attack surface) |
| OWASP Mobile Security Top 10 | React Native app vulnerabilities |
| OWASP MASVS v2 | Mobile application security verification standard — use as a testing checklist |
| OWASP ASVS v4 | Web application security verification standard — use for code review and pen test scope |
| OWASP Testing Guide (OTG) | Manual test procedures for pen testers |
| OWASP Secure Coding Practices | Developer reference guide |

**OWASP API Security Top 10 (2023) — mapped to your risk:**

| Rank | Vulnerability | Your Risk | Fix |
|------|--------------|-----------|-----|
| API1:2023 | Broken Object Level Authorization (BOLA) | CRITICAL — /enquiry/{id}, /property/{id}/leads, /user/{id} | Object-level authz on every endpoint |
| API2:2023 | Broken Authentication | HIGH — OTP brute force, JWT weaknesses | Rate limiting, short JWT TTL, rotation |
| API3:2023 | Broken Object Property Level Authorization | HIGH — mass assignment on user/listing update | Allow-list for writable fields only |
| API4:2023 | Unrestricted Resource Consumption | HIGH — scrapers hitting search/listing APIs | Rate limiting, pagination caps, quotas |
| API5:2023 | Broken Function Level Authorization | HIGH — admin endpoints reachable without admin role | Role check on every function |
| API6:2023 | Unrestricted Access to Sensitive Business Flows | HIGH — bulk enquiry, mass contact reveal | Per-user quotas on sensitive flows |
| API7:2023 | Server Side Request Forgery (SSRF) | MEDIUM — image upload/fetch from URL | Allowlist for internal services; block metadata endpoints |
| API8:2023 | Security Misconfiguration | MEDIUM — Supabase anon key with no RLS | Hardening checklist; automated config scanning |
| API9:2023 | Improper Inventory Management | MEDIUM — old API versions left accessible | API versioning; deprecate and remove old endpoints |
| API10:2023 | Unsafe Consumption of APIs | LOW-MEDIUM — third-party property data feeds | Validate and sanitise all third-party API responses |

#### G. NIST Cybersecurity Framework (CSF) 2.0

Globally recognised framework (Identify, Protect, Detect, Respond, Recover + Govern in v2.0). Use as the structural organiser for your security programme. Maps well to ISO 27001 and DPDP requirements.

#### H. CIS Controls v8

Prioritised, actionable security controls. The first 6 Implementation Group 1 controls are your immediate baseline:
1. Inventory and control of enterprise assets
2. Inventory and control of software assets
3. Data protection
4. Secure configuration of enterprise assets and software
5. Account management
6. Access control management

---

## 3. Comprehensive Threat Model

### 3.1 Threat Actor Categories

| Actor | Motivation | Capabilities |
|-------|------------|-------------|
| Scrapers (automated bots) | Harvest phone numbers, listing data for competing portals or lead resellers | High-volume API calls, JS rendering, CAPTCHA solving |
| Fraudulent listers | Post fake properties; collect advance deposits | Social engineering, fake documents |
| Competitor intelligence | Harvest pricing data, listing inventory | Automated, systematic, recurring |
| Account hijackers | Take over verified agent accounts; post fraudulent listings | OTP interception, SIM swap, credential stuffing |
| Nation-state / advanced threat | Data theft, platform disruption | Sophisticated; not primary concern at MVP stage |
| Payment fraudsters | Manipulate pricing, replay payment webhooks | API tampering, webhook forgery |
| Disgruntled agents/builders | Sabotage competitor listings, false RERA complaints | Insider threat vector |
| Identity thieves | Use platform for KYC bypass, financial fraud | Social engineering |
| Supply chain attackers | Compromise your npm dependencies or CI/CD | Package typosquatting, dependency confusion |

### 3.2 Attack Surface Map

```
Internet
├── Web Application (Next.js on Vercel)
│   ├── Public listing pages (SEO, no auth)
│   ├── Search API (scrapers target this)
│   ├── Contact reveal endpoint (crown jewels)
│   ├── User auth flows (OTP, OAuth)
│   └── File upload (property photos)
├── REST/GraphQL APIs (Render backend)
│   ├── Property CRUD endpoints
│   ├── Enquiry management
│   ├── User profile management
│   ├── Agent/builder dashboard APIs
│   └── Admin APIs (highest value target)
├── Mobile App (React Native, iOS + Android)
│   ├── Device storage (tokens, cached data)
│   ├── Network calls (certificate pinning)
│   └── Deep links (phishing vector)
├── Third-party Integrations
│   ├── Razorpay (payment)
│   ├── Supabase (database)
│   ├── SMS/WhatsApp vendors
│   ├── GujRERA API
│   └── Map provider (Google Maps API key)
└── Internal / Admin
    ├── Supabase dashboard
    ├── Vercel dashboard
    ├── Render dashboard
    └── CI/CD (GitHub Actions)
```

### 3.3 Detailed Threat Scenarios

**T1: Contact Reveal / PII Harvesting**
- Attacker creates accounts and systematically calls the contact-reveal API for all listings
- Impact: Owner phone numbers sold to competitors, telemarketers; DPDP breach
- Controls: Per-user rate limit (e.g., 10 reveals/day), CAPTCHA, anomaly detection on reveal volume

**T2: BOLA — Cross-Tenant Data Access**
- Attacker changes the ID in an API call (GET /enquiry/1234 → GET /enquiry/1235) to read another user's enquiry
- Impact: Mass PII exposure; mandatory DPDP and CERT-In reporting
- Controls: Object-level authorization on every endpoint; Supabase RLS as defence-in-depth

**T3: Fake Listing Fraud**
- Agent creates listing for a property they don't own; collects "advance booking fee" outside platform
- Impact: Consumer harm; RERA violation; platform reputation damage
- Controls: RERA number verification for new projects; photo geolocation validation; report/flag mechanism

**T4: Account Takeover via OTP Interception**
- SIM swap attack on a high-value agent account; attacker receives OTP; gains full account access
- Impact: Fraudulent listings posted from trusted account; financial fraud
- Controls: OTP rate limiting + lockout; device fingerprinting; anomaly detection on login location; re-auth for sensitive operations

**T5: Payment Webhook Forgery**
- Attacker forges a Razorpay webhook payload to mark a premium subscription as paid
- Impact: Free access to premium features; revenue loss
- Controls: Verify webhook HMAC signature; cross-verify with Razorpay Order Status API; idempotency keys

**T6: Malicious Listing Content (Stored XSS)**
- Agent embeds `<script>` tag in property description
- Impact: Session theft for any user who views the listing; admin compromise if admin previews
- Controls: Output encoding on all user-generated content; strict CSP blocking inline scripts

**T7: Aadhaar/PAN Data Exfiltration**
- Attacker exploits BOLA or SQL injection to dump the table containing KYC documents
- Impact: Mass identity theft; severe DPDP violation; Aadhaar Act violation
- Controls: Field-level encryption for Aadhaar/PAN; RLS; regular penetration testing

**T8: SSRF via Image URL**
- Agent submits a "property photo URL" pointing to http://169.254.169.254/latest/meta-data/ (AWS metadata)
- Impact: Cloud credential theft; complete platform compromise
- Controls: Never fetch attacker-supplied URLs server-side; use a sandboxed image proxy with allowlists

**T9: Supply Chain — Malicious npm Package**
- A dependency in your Next.js or React Native build is compromised
- Impact: Payment page skimming, backdoor, credential theft
- Controls: Subresource Integrity, Dependabot/Snyk, lockfile pinning, npm provenance verification

**T10: Admin Panel Compromise**
- Admin panel accessible on the open internet without additional auth
- Impact: Full platform takeover, data theft, listing manipulation
- Controls: Cloudflare Zero Trust in front of admin; hardware MFA; IP allowlisting

---

## 4. Security Architecture — 8-Layer Defense in Depth

### Layer 1: Edge & Perimeter (Cloudflare)

```
User → Cloudflare Edge → Origin (Vercel / Render)
         ├── TLS 1.3 termination + HSTS preload
         ├── WAF (OWASP Core Ruleset + custom rules)
         ├── DDoS protection (L3/L4/L7)
         ├── Bot Management (Machine Learning + fingerprinting)
         ├── Rate limiting (per-IP, per-token, per-endpoint)
         ├── Geo-restrictions if needed
         ├── Turnstile (privacy-preserving CAPTCHA) on sensitive endpoints
         └── Zero Trust (Access) for admin surfaces
```

**Security headers on all responses:**
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: [see below]
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

**CSP for listing/non-payment pages:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://your-cdn.com https://*.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.propunified.com https://supabase.co;
  frame-src https://checkout.razorpay.com;
  report-uri https://csp-reporter.propunified.com/report;
```

### Layer 2: Identity & Access Management (IAM)

**Authentication:**
- Primary: Phone number + OTP (DLT-registered sender)
- Social: Google OAuth 2.0 / Facebook Login (scoped to email only)
- JWT access tokens: 15-minute TTL, RS256 signed
- Refresh tokens: 30-day TTL, httpOnly + Secure + SameSite=Strict cookie, stored in DB with device fingerprint
- Revoke all refresh tokens on password/phone change, suspicious activity detection, explicit logout

**Authorisation:**
```
Roles: buyer | owner | agent | builder | admin | support | moderator
Permissions defined as role→resource→action matrix
Every API endpoint explicitly checks: is(user.role, allowedRoles) AND isOwner(user.id, resource.ownerId)
```

**Admin access:**
- All admin surfaces behind Cloudflare Zero Trust (device posture check + SAML SSO)
- Hardware MFA (FIDO2/WebAuthn) for admin accounts
- Privileged session recording
- Break-glass procedure for emergency access with post-hoc review

**Supabase specific:**
- `anon` key: read-only, rate-limited, only for public data
- `service_role` key: **never exposed to client; server-side only** in Render backend
- Every table with PII: explicit RLS policies before any data is inserted

### Layer 3: Application Security

**Input validation:**
- JSON Schema validation on all API request bodies (Zod / Joi)
- Allow-lists for all string fields (reject HTML/script unless explicitly allowed)
- File upload: validate MIME type by magic bytes (not extension), max size limit, virus scan via ClamAV or third-party

**Output encoding:**
- All user-generated content HTML-escaped before rendering
- No `dangerouslySetInnerHTML` with user-provided data
- Property descriptions: sanitise with DOMPurify before display

**SQL injection prevention:**
- All database access through Supabase client (parameterised queries) or Prisma ORM
- No raw SQL string concatenation with user input
- RLS as additional defence layer

**Object-level authorisation (fix for BOLA):**
```typescript
// BAD — missing ownership check
app.get('/enquiry/:id', async (req, res) => {
  const enquiry = await db.enquiry.findById(req.params.id);
  res.json(enquiry);
});

// GOOD — always check ownership
app.get('/enquiry/:id', authenticate, async (req, res) => {
  const enquiry = await db.enquiry.findOne({
    id: req.params.id,
    userId: req.user.id  // only return if owned by requesting user
  });
  if (!enquiry) return res.status(404).json({ error: 'Not found' });
  res.json(enquiry);
});
```

**Contact reveal gating:**
- API endpoint does not return phone number in listing payload
- Separate authenticated + rate-limited `/reveal-contact/{listingId}` endpoint
- Logs: userId, listingId, IP, timestamp, device fingerprint on every reveal
- Consider proxy number masking (Exotel, Servetel) for high-value listings so real owner number never exposed

### Layer 4: Data Protection

**Data at rest:**
- Supabase: Postgres with AES-256 encryption at rest (AWS EBS encryption)
- Object storage (property photos): S3 with SSE-KMS, bucket policy denying public access (serve via Cloudflare CDN with signed URLs)
- Backups: encrypted, tested restores monthly, offsite copy

**Data in transit:**
- TLS 1.3 everywhere; no TLS 1.0/1.1
- HSTS preloaded
- Internal service-to-service: mutual TLS where feasible

**Field-level encryption (for highest-sensitivity fields):**
- Aadhaar number (if stored): encrypted with application-managed key, stored in UIDAI-compliant vault
- PAN number: encrypted
- Bank account details: encrypted or tokenised via Razorpay
- Never store raw card numbers

**Data residency:**
- Supabase project: ap-south-1 (Mumbai) region
- Vercel Edge: restrict to India edge nodes for API routes handling PII
- Render: India region where available, otherwise Singapore (closest)
- No PII in Vercel analytics or third-party analytics that routes outside India

### Layer 5: Supabase Hardening

```sql
-- Example RLS policies — implement for every PII table

-- Users can only read/update their own profile
CREATE POLICY "users_own_profile" ON users
  USING (auth.uid() = id);

-- Enquiries: sender and recipient (listing owner) can read
CREATE POLICY "enquiry_parties_read" ON enquiries
  USING (
    auth.uid() = sender_id OR
    auth.uid() = (SELECT owner_id FROM listings WHERE id = enquiries.listing_id)
  );

-- Listings: owner can CRUD; authenticated users can read active listings
CREATE POLICY "listings_owner_crud" ON listings
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "listings_public_read" ON listings
  FOR SELECT USING (status = 'active');

-- Saved searches: private to user
CREATE POLICY "saved_searches_private" ON saved_searches
  USING (auth.uid() = user_id);

-- Phone numbers: never return raw phone in any query accessible to anon key
-- Implement at application layer; also restrict at column level
GRANT SELECT (id, name, email, avatar_url, created_at) ON users TO anon;
-- phone_number column NOT granted to anon role
```

### Layer 6: Payment Security

- Razorpay hosted checkout only (maintain SAQ A)
- Server-side webhook signature verification:
```typescript
import crypto from 'crypto';

function verifyRazorpayWebhook(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
```
- Cross-verify every successful payment with Razorpay Order Status API before marking order complete
- Idempotency keys on all payment initiation requests
- Payment records retained for 8 years (GST audit requirement)

### Layer 7: Mobile Application Security (OWASP MASVS v2)

**Storage (MAS-S):**
- Auth tokens in Keychain (iOS) / Keystore (Android) — never AsyncStorage for sensitive data
- No sensitive data in application logs
- No credentials, API keys, or secrets in the app bundle
- Enable iOS Data Protection (complete protection class) for local database

**Cryptography (MAS-C):**
- Use platform-provided cryptographic APIs only; no custom implementations
- AES-256-GCM for local data encryption
- Secure random number generation (SecureRandom / Security.secureRandom)

**Authentication (MAS-A):**
- Certificate pinning for all API calls to your backend
- Biometric authentication for app unlock (FaceID/TouchID/Fingerprint) — supplementary to server-side auth
- Timeout + re-auth after 15 minutes of inactivity for sensitive operations

**Network (MAS-N):**
- Certificate pinning with backup pins; graceful fallback + alert on pin mismatch
- No plain HTTP calls anywhere
- Cleartext traffic disabled (Android network security config)

**Platform (MAS-P):**
- Disable clipboard for sensitive fields (phone numbers, financial data)
- Screenshot prevention for sensitive screens (LayoutParams.FLAG_SECURE on Android; iOS screenshot detection)
- Jailbreak/root detection for high-value flows (loan application, large transactions)

**Code (MAS-CODE):**
- Enable ProGuard/R8 obfuscation on Android release builds
- Strip debugging symbols from iOS release builds
- No debug logs in release builds
- Implement app integrity verification (Play Integrity API / App Attest)

### Layer 8: Monitoring, Detection & Response

**What to log (every event):**
- Authentication events: success, failure, OTP request, lockout, OAuth
- Authorisation events: access granted, access denied, privilege escalation attempt
- PII access: which user accessed whose phone number, when, from where
- Payment events: initiation, webhook received, verification, success, failure
- Admin actions: all create/update/delete operations in admin panel
- Content moderation: listing created, flagged, reviewed, removed
- Error events: 4xx/5xx responses, exceptions, dependency failures

**Log format:** Structured JSON with: timestamp (ISO 8601 with timezone), event_type, user_id, session_id, ip_address, user_agent, resource_type, resource_id, action, outcome, latency_ms

**Log retention:** 12 months minimum (DPDP Rule 6) + 180 days must be in India (CERT-In)

**SIEM alerts (respond within SLA):**
| Alert | SLA | Trigger |
|-------|-----|---------|
| Contact reveal spike | 5 min | >10 reveals from single user in 1 hour |
| Authentication brute force | 1 min | >10 failed OTPs per phone in 10 min |
| Admin login from new device/country | 2 min | Any admin auth event |
| Database enumeration | 5 min | Sequential ID pattern in API calls |
| Payment webhook signature failure | 1 min | Any invalid signature |
| RLS policy bypass attempt | Immediate | Supabase error pattern for policy violations |
| Large data export | 5 min | API response >10MB from single session |

---

## 5. Data Governance & Classification

### 5.1 Data Classification Framework

| Class | Definition | Examples | Controls |
|-------|------------|---------|----------|
| **Public** | Intentionally published | Property listing details (no owner contact), neighbourhood data | Standard web controls |
| **Internal** | Internal operations only | Platform analytics, internal dashboards | Authentication required |
| **Confidential** | User PII, business data | User profiles, enquiry history, agent leads | Encryption + RLS + access logging |
| **Restricted** | Highest sensitivity | Aadhaar/PAN, financial data, legal documents | Field-level encryption + strict access control + audit trail |

### 5.2 Record of Processing Activities (RoPA)

Mandatory under DPDP (best practice under §43A SPDI). Maintain for each processing activity:

| Field | Example |
|-------|---------|
| Activity name | User registration |
| Data Fiduciary | Prop Unified Pvt. Ltd. |
| Data categories | Name, phone, email, device ID |
| Purpose | Create account, authenticate user |
| Legal basis | Consent (Rule 4) |
| Data Principals | Buyers, owners, agents |
| Processors | Supabase, MSG91 (OTP) |
| Retention period | 3 years post-last activity, then erasure |
| Cross-border transfer | None — India residency enforced |
| Security controls | Encryption at rest/transit, RLS, access logs |

### 5.3 Data Inventory

Map every data element to its source, storage location, access pattern, and retention schedule. Review quarterly.

---

## 6. Identity, Authentication & Access Management

*(Architecture detailed in Layer 2 above. Additional specifics:)*

**OTP Security:**
- OTP: 6 digits, valid for 5 minutes only, single use
- Rate limiting: max 3 OTP requests per phone per 10 minutes
- Lockout: 5 failed OTP attempts → 30-minute lockout
- Exponential backoff on repeated failures
- Notify user via app/email when OTP requested from new device

**Session Management:**
- Access token: JWT, RS256, 15-min TTL, contains: user_id, role, session_id
- Refresh token: opaque, 30-day TTL, stored server-side with device_fingerprint + ip_hash
- Concurrent session limit: 5 devices per user
- Session invalidation: on password change, phone change, suspicious activity, explicit logout from all devices

**Password Policy (if you implement passwords):**
- Minimum 12 characters
- No maximum length restriction
- Check against HaveIBeenPwned corpus on registration/change
- bcrypt with cost factor ≥ 12 for storage
- Rate-limit password reset to 3/hour per email

---

## 7. Application Security Controls

**Secure Development Lifecycle (SDL):**

| Phase | Controls |
|-------|---------|
| Design | Threat modelling for new features; privacy-by-design review |
| Develop | Secure coding training; peer code review; dependency pinning |
| Test | SAST (Semgrep/SonarQube) in CI; DAST (OWASP ZAP) on staging |
| Deploy | Secrets scan (Trufflehog) before merge; signed commits; branch protection |
| Operate | SIEM monitoring; anomaly alerts; vulnerability scanning |
| Review | Annual penetration test; quarterly internal security review |

**API Security Specifics:**
- All APIs versioned (/api/v1/, /api/v2/)
- Deprecated versions removed after 90-day migration window
- OpenAPI spec maintained and kept current
- API Gateway enforces: auth, rate limiting, schema validation, request size limit (1MB default)
- Response headers: X-Content-Type-Options, Cache-Control on PII responses

**File Upload Security:**
- Validate file type by magic bytes (libmagic), not extension
- Max file size: 10MB per image, 50MB per document
- Virus scanning: ClamAV or cloud-based AV on upload
- Rename all uploaded files to UUID (prevent path traversal)
- Store in S3/equivalent; never serve from application server
- Generate short-lived signed URLs for access
- Strip EXIF metadata (location data) from photos before storage

---

## 8. Infrastructure & Cloud Security

**Vercel:**
- Preview deployment protection: enable auth on all preview URLs
- Environment variables: never use NEXT_PUBLIC_ prefix for secrets
- Security headers set in next.config.js middleware
- Enable Vercel Firewall for edge-level blocking
- Deployment alerts: Slack/PagerDuty notification for every production deploy

**Supabase:**
- Project region: ap-south-1 (Mumbai)
- Enable Supabase audit logging (all SQL and auth events)
- Database connection pooling via pgbouncer (not direct connections from edge functions)
- Backup: daily automated backups, 30-day PITR, test restore monthly
- network access: restrict database access to Render IP ranges only (not public)

**Render:**
- Private networking between API service and any worker services
- Database not publicly accessible
- Environment variables via Render's secret store
- Egress rules: restrict to required third-party API endpoints

**Infrastructure as Code:**
- All infrastructure defined as code (Terraform / Pulumi)
- IaC stored in private Git repository with branch protection
- Drift detection: automated alerts when live infra differs from IaC state
- Immutable infrastructure: deploy new instances rather than patching live

**Secrets Management:**
- No secrets in code repositories (enforced by pre-commit hook + Trufflehog scan in CI)
- No secrets in Docker images or CI/CD logs
- Rotate all secrets quarterly; rotate immediately on suspected compromise
- Use Vault or cloud-native secrets manager; Vercel/Render env vars for runtime secrets

---

## 9. Payment Security

*(Detailed in Layer 6 and Section 2.4. Summary:)*

**Razorpay Integration Checklist:**
- [ ] Hosted checkout only (iframe/redirect — not embedded card fields)
- [ ] Webhook signature verification on every event
- [ ] Server-side order status verification before fulfilling orders
- [ ] Idempotency keys on order creation
- [ ] Never log card numbers (even partial, except last 4 digits for display)
- [ ] Razorpay tokenisation for saved payment methods
- [ ] CSP: only `https://checkout.razorpay.com` in frame-src and connect-src
- [ ] PCI DSS SAQ A self-assessment completed annually
- [ ] Merchant KYC with Razorpay completed (RBI PA Master Direction mandate)

---

## 10. Mobile Application Security

*(Detailed in Layer 7. OWASP MASVS v2 compliance target.)*

**Additional React Native specific controls:**
- Use `react-native-encrypted-storage` not AsyncStorage for auth tokens
- Implement SSL pinning with `react-native-ssl-pinning` or OkHttp pinning on Android
- Disable `allowBackup` in AndroidManifest.xml for sensitive user data
- Enforce Play Integrity / App Attest for transaction-critical flows
- Regular dependency audit (`npm audit`, Snyk) in mobile CI pipeline
- Build signing: store release keystore in secure key management, never in repository

---

## 11. Operational Security & Monitoring

**Vulnerability Management:**
- Weekly automated dependency scan (Dependabot / Snyk)
- Monthly infrastructure vulnerability scan (Nessus / Qualys equivalent)
- Quarterly DAST scan of staging environment
- Annual full penetration test by CERT-In empanelled firm
- Critical/High vulnerabilities: remediate within 7 days
- Medium: 30 days
- Low: 90 days

**Change Management:**
- All production changes through pull request with at least one peer review
- Automated test suite must pass before merge
- Staging deployment and testing before production
- Rollback plan documented for every deployment
- Emergency change procedure with post-incident review

**Business Continuity:**
- RTO (Recovery Time Objective): 4 hours for core platform
- RPO (Recovery Point Objective): 1 hour (Supabase PITR backup)
- DR runbook maintained and tested semi-annually
- Status page (statuspage.io or equivalent) for user communication during incidents

---

## 12. Incident Response & Breach Management

### 12.1 Incident Classification

| Severity | Definition | Response Time |
|----------|------------|---------------|
| P1 — Critical | Data breach, platform down, ransomware, active attack | Immediate — within 15 minutes |
| P2 — High | Suspected breach, partial service disruption, account takeover campaign | Within 1 hour |
| P3 — Medium | Non-critical vulnerability exploited, single account compromise | Within 4 hours |
| P4 — Low | Suspected anomaly, configuration issue, policy violation | Within 24 hours |

### 12.2 The Two Breach Clocks

**Clock 1: CERT-In (6 hours)**
From the moment you are *aware* of a reportable incident (see 20 categories in Section 2.2B):
- Hour 0: Incident detected and declared
- Hour 1: Incident Commander assigned; initial triage complete
- Hour 4: Draft report prepared
- **Hour 6: Report filed with CERT-In at incident@cert-in.org.in**

Report must include: incident description, affected systems, attack vector (if known), containment actions taken.

**Clock 2: DPDP Board + Data Principals (72 hours)**
- Hour 0–6: Run parallel to CERT-In. Determine if personal data was affected.
- Hour 6–48: Forensic investigation; scope of PII exposure determined
- Hour 48–72: **Board notification filed; individual Data Principal notices sent**

Board notification must include: nature of breach, categories and estimated volume of affected Data Principals, likely consequences, measures taken to address breach, contact details of DPO/privacy lead.

Data Principal notice: plain language, specific, what happened, what data, what to do, how to contact you.

### 12.3 Incident Response Playbook

**Phase 1 — Detect & Declare (0–30 min):**
1. Alert received (SIEM / user report / third-party notification)
2. On-call engineer triages; declares incident if confirmed
3. Incident Commander assigned from on-call roster
4. Incident channel created (Slack #incident-YYYY-MM-DD-NNN)
5. Status page updated: "Investigating"
6. CERT-In clock starts

**Phase 2 — Contain (30 min–4 hours):**
1. Isolate affected systems (Cloudflare rule to block attack IPs, disable compromised accounts)
2. Revoke potentially compromised credentials (Supabase service keys, API keys)
3. Take forensic snapshot before remediation (do not destroy evidence)
4. Preserve logs to immutable storage
5. Determine scope: what data was accessed/exfiltrated?

**Phase 3 — Notify (4–72 hours):**
1. File CERT-In report by Hour 6
2. Notify Data Protection Board by Hour 72 (if personal data affected)
3. Notify affected Data Principals (by Hour 72 or "without delay" — whichever is sooner)
4. Notify Razorpay if payment data potentially affected (they have their own PA obligations)
5. Notify cyber insurance provider

**Phase 4 — Eradicate & Recover (4–72 hours):**
1. Root cause identified
2. Vulnerability patched or compensating control in place
3. Systems restored from clean backups if needed
4. Enhanced monitoring deployed
5. Status page updated when resolved

**Phase 5 — Post-Incident (within 2 weeks):**
1. Full post-incident report written (5-why root cause analysis)
2. Lessons learned session with all stakeholders
3. Action items tracked to completion
4. Update threat model and controls if needed
5. Train team on new indicators of compromise

### 12.4 Pre-Written Notification Templates

Maintain pre-approved legal templates for:
- CERT-In initial report
- CERT-In detailed follow-up
- DPB notification (72-hour)
- Data Principal SMS/email notification
- Press/public statement
- Razorpay notification

---

## 13. Third-Party & Supply Chain Risk

### 13.1 Vendor Risk Assessment

Before onboarding any vendor that processes PII or has access to your systems:

| Assessment Area | Questions |
|----------------|-----------|
| Security certifications | ISO 27001, SOC 2 Type II, PCI DSS (for payment) |
| Data residency | Do they store data in India? |
| Breach history | Have they had incidents? How did they respond? |
| Sub-processors | Who do they share your data with? |
| Contractual | Will they sign DPDP-compliant DPA? |
| Access control | Principle of least privilege? Just-in-time access? |
| Incident notification | Will they notify you within 24 hours of a breach affecting your data? |

### 13.2 Critical Vendor Risk Profile

| Vendor | Risk Level | Key Controls Required |
|--------|-----------|----------------------|
| Supabase | HIGH — holds all PII | Data Processing Agreement; verify ISO 27001 / SOC 2; confirm India region; RLS enforcement |
| Vercel | MEDIUM — executes server-side code, may log requests | DPA; confirm no PII in build logs; deployment protection |
| Render | MEDIUM — runs API server | DPA; private networking; env var secrets |
| Razorpay | HIGH — handles payments | Already regulated by RBI PA; PCI DSS Level 1; sign merchant agreement |
| SMS/OTP provider (MSG91 / Twilio) | HIGH — receives phone numbers | DPA; DLT registration; confirm data retention limits |
| WhatsApp BSP | MEDIUM | Meta WhatsApp Business Policy compliance; DPA |
| Google Maps | LOW | No PII sent to Maps API (use client-side only) |
| GujRERA API | LOW | Government service; read-only integration |

### 13.3 Software Supply Chain Security

- **Dependency management:** lockfile committed to repo; `npm ci` (not `npm install`) in CI
- **Dependency scanning:** Dependabot alerts on GitHub; Snyk integration in CI pipeline
- **Package integrity:** Subresource Integrity (SRI) for any CDN-loaded scripts
- **npm provenance:** Verify package provenance where available (npm v9+)
- **Typosquatting protection:** Use npm audit and internal mirror for critical packages
- **CI/CD security:** GitHub Actions with pinned action versions (SHA, not tags); OIDC token-based cloud auth (no long-lived secrets in CI)
- **Container security:** If you use containers, scan images with Trivy before pushing to registry

---

## 14. Privacy Engineering & DPDP Operationalisation

### 14.1 Privacy by Design Principles

Apply across all feature development:
1. **Proactive, not reactive** — build privacy in; don't bolt it on
2. **Default to privacy** — maximum privacy settings by default
3. **Full functionality** — privacy and functionality are not zero-sum
4. **End-to-end security** — security throughout the lifecycle
5. **Visibility and transparency** — document and disclose what you do
6. **Respect for user privacy** — keep it user-centric
7. **Data minimisation** — collect only what you need for the stated purpose

### 14.2 Consent Architecture

```
User arrives → Show consent notice (Rule 3)
                ├── Purpose 1: Account creation [Accept / Decline]
                ├── Purpose 2: Property alerts [Accept / Decline]  
                ├── Purpose 3: Marketing communications [Accept / Decline]
                └── Purpose 4: Analytics/improvement [Accept / Decline]

Consent stored: { userId, purpose, version, timestamp, ipAddress, method }

Withdrawal: User can withdraw per-purpose at any time from Settings
            → Triggers downstream revocation cascade
            → Data processed under that purpose is flagged for erasure (where no other lawful basis)
```

**Consent record fields (immutable log):**
- user_id, session_id
- notice_version (version of the text shown)
- purpose_id
- decision (accept / decline)
- timestamp (ISO 8601 UTC)
- ip_address, user_agent
- method (explicit click, API)

### 14.3 Data Subject Rights Implementation

Build self-service into your user settings panel:

| Right | User Journey | Backend Action | SLA |
|-------|-------------|----------------|-----|
| Access | Settings → My Data → Download | Generate JSON/PDF export of all user data | 90 days |
| Correction | Settings → Edit Profile | Update with audit trail | 90 days |
| Erasure | Settings → Delete Account | Soft delete → 48h notice → hard delete; anonymise analytics data | 90 days |
| Withdraw consent | Settings → Privacy → Manage Preferences | Per-purpose revocation | Immediate |
| Grievance | Help → Contact DPO | Route to privacy@propunified.com | 7 days (DPDP) |

### 14.4 Data Retention Schedule

| Data Type | Retention Period | Basis |
|-----------|-----------------|-------|
| Active user account data | Duration of account + 6 months | Contractual need |
| Inactive account data | 3 years from last login, then erasure with 48h notice | DPDP Rule 8 |
| Enquiry / lead data | 2 years | Business purpose |
| Payment records | 8 years | GST/Income Tax audit requirement |
| Security / audit logs | 1 year minimum (DPDP) / 180 days in India (CERT-In) — apply 1 year | Regulatory |
| KYC documents | 5 years from account closure | PMLA (if applicable) |
| Marketing consent records | Duration of consent + 3 years | Legal evidence |
| CCTV (if any at office) | 30 days | Industry practice |

### 14.5 Data Protection Impact Assessment (DPIA)

Conduct DPIA (and document it) before launching any high-risk processing activity:

| Scenario | Why a DPIA is needed |
|----------|---------------------|
| Aadhaar/biometric KYC integration | Biometric data is high-risk |
| Behavioural profiling for personalisation | Systematic monitoring of users |
| AI-powered listing valuation using user data | Automated decision-making |
| Cross-platform data sharing with analytics vendor | Third-party access to PII |
| Children's features | Minors — high risk |
| Property transaction facilitation with financial data | High sensitivity + financial data |

---

## 15. Security Governance Structure

### 15.1 Roles and Responsibilities

| Role | Person | Responsibilities |
|------|--------|-----------------|
| Data Protection Officer (DPO) | Appoint by 13 May 2027 (mandatory for SDFs; best practice now) | Privacy programme ownership; DPDP compliance; regulatory liaison |
| Chief Information Security Officer (CISO) | Founder / Head of Engineering initially | Security strategy; risk management; incident response authority |
| Incident Commander | On-call rotation | Leads incident response; decision authority during incidents |
| Grievance Officer | Named India-resident individual | Consumer Protection Act + IT Rules compliance; complaint resolution |
| Nodal Contact Person | India-resident (needed at SSMI threshold) | 24×7 law enforcement liaison |
| Security Champion | Per development team | Security review in sprint; secure coding practices |

### 15.2 Security Governance Cadence

| Meeting | Frequency | Participants | Agenda |
|---------|-----------|-------------|--------|
| Security Review | Monthly | CISO, engineering leads | Vulnerability status, open findings, upcoming changes |
| Risk Review | Quarterly | CISO, CEO, DPO | Risk register update, regulatory changes, audit status |
| Tabletop Exercise | Quarterly | All incident response team | Simulate an incident scenario; test playbook |
| Penetration Test Review | Annual | CISO, engineering | Review pen test findings; prioritise remediation |
| Compliance Audit | Annual | DPO, CISO, finance, legal | ISO 27001 surveillance + internal compliance review |
| Board/Investor Update | Quarterly | C-suite + board | Security posture summary; material risks |

### 15.3 Risk Register

Maintain a formal risk register with:
- Risk ID, description, category
- Likelihood (1–5), Impact (1–5), Risk Score
- Current controls
- Residual risk
- Risk owner
- Treatment: Accept / Mitigate / Transfer / Avoid
- Review date

Top risks at launch:
1. DPDP non-compliance before deadline — HIGH likelihood, CRITICAL impact → Mitigate
2. BOLA vulnerability leading to PII exposure — MEDIUM likelihood, CRITICAL impact → Mitigate (fix now)
3. Razorpay webhook forgery → payment fraud — MEDIUM likelihood, HIGH impact → Mitigate
4. Scraper harvesting owner contacts → commercial loss + DPDP issue — HIGH likelihood, HIGH impact → Mitigate + Monitor
5. GujRERA non-compliant listings → regulatory action — MEDIUM likelihood, HIGH impact → Mitigate (verify before publish)

---

## 16. Compliance Roadmap & Implementation Timeline

### Phase 0 — This Month (Immediate: Highest Risk)

- [ ] Audit all API endpoints for BOLA — fix object-level authorisation
- [ ] Enable Supabase RLS on ALL tables containing PII; move service_role to server-side only
- [ ] Stop returning raw phone numbers in listing API payloads; implement reveal gating
- [ ] Enable Cloudflare WAF (OWASP Core Ruleset) + rate limiting + Turnstile on auth and contact-reveal
- [ ] Cloudflare Zero Trust in front of admin panel; enforce hardware MFA for all admin accounts
- [ ] Set security headers (CSP, HSTS, X-Content-Type-Options) on all responses
- [ ] Verify Razorpay merchant KYC completed (RBI PA Master Direction deadline: Dec 2025)
- [ ] Complete Razorpay webhook signature verification implementation
- [ ] Add GujRERA QR code to all new project listings (mandate active since June 2025)
- [ ] Appoint named Grievance Officer; publish contact on platform (IT Rules 2026)
- [ ] Register DLT headers and SMS templates before next bulk communication

### Phase 1 — 1–3 Months (DPDP Foundations + Legal Baseline)

- [ ] Appoint DPO / privacy lead (best practice now; mandatory for SDFs by May 2027)
- [ ] Engage legal counsel to confirm DPDP applicability thresholds and SDF risk
- [ ] Draft plain-language consent notice in English, Hindi, and Gujarati
- [ ] Build consent capture + versioning system; store consent records
- [ ] Implement Data Principal rights self-service (access/correct/erase within 90-day SLA)
- [ ] Set up centralised audit logging with 1-year retention; onboard to SIEM
- [ ] Write breach-response playbook; create pre-written CERT-In / DPB / user notification templates
- [ ] Data Processing Agreements signed with all critical vendors (Supabase, Vercel, Render, MSG91)
- [ ] Build Record of Processing Activities (RoPA)
- [ ] Complete and document PCI DSS SAQ A
- [ ] Register GujRERA agent account for your platform (if facilitating agent transactions)
- [ ] Publish Privacy Policy, Terms of Service, Grievance / DPDP notice page
- [ ] DLT registration and template pre-approval for all active SMS campaigns
- [ ] Company registration, GSTIN, CIN — display on platform as per Consumer Protection Rules

### Phase 2 — 3–9 Months (Security Maturity + ISO 27001)

- [ ] Initiate ISO 27001:2022 implementation (engage consultant; gap assessment)
- [ ] Automated data retention and erasure jobs (DPDP Rule 8); 48-hour pre-erasure notice flow
- [ ] First tabletop incident response exercise; test the CERT-In 6-hour clock
- [ ] Annual penetration test by CERT-In empanelled firm; remediate all Critical/High findings
- [ ] Mobile app security hardening (certificate pinning, secure storage, MASVS v2 checklist)
- [ ] Dependency scanning pipeline (Snyk/Dependabot) integrated into CI/CD
- [ ] Deploy proxy number masking for property owner contacts (Exotel/Servetel integration)
- [ ] DPIA completed for Aadhaar eKYC, AI features, behavioural profiling (if implemented)
- [ ] First DPDP-aligned Data Principal notice published in all three languages
- [ ] Staff security awareness training programme (mandatory for all, quarterly for engineering)
- [ ] Complete ISO 27001 Stage 1 and Stage 2 audit; achieve certification
- [ ] Anomaly detection rules tuned; false positive rate acceptable

### Phase 3 — 9–18 Months (Full DPDP Compliance by May 2027)

- [ ] ISO 27701 (Privacy extension) implementation
- [ ] SOC 2 Type II readiness assessment
- [ ] Full DPDP operational compliance before 13 May 2027 deadline
- [ ] Consent Manager integration (if applicable for your scale by Nov 2026)
- [ ] SDF designation monitoring; if designated, full SDF programme operational
- [ ] Annual compliance audit covering all frameworks
- [ ] FEMA/RBI compliance review if NRI transaction volumes are significant
- [ ] CCI competition law review if market share in Gujarat reaches 20%+
- [ ] Accessibility audit (WCAG 2.2 AA) and remediation for web + mobile

### Phase 4 — Ongoing

- [ ] Annual ISO 27001 surveillance audit
- [ ] Annual penetration test
- [ ] Quarterly tabletop exercises
- [ ] Monthly security metrics report to leadership
- [ ] Continuous dependency scanning and vulnerability management
- [ ] DPDP regulatory updates monitoring (Data Protection Board guidance)
- [ ] GujRERA regulatory updates monitoring
- [ ] RBI / payment regulatory updates monitoring
- [ ] Quarterly review and update of RoPA, risk register, and vendor assessments

---

## 17. Audit & Assurance Programme

### 17.1 Internal Audit

**Monthly:** Security metrics review — open vulnerabilities, patch compliance, SIEM alert trends, access review

**Quarterly:**
- Privilege access review (who has admin/elevated access? is it still needed?)
- Vendor security scorecard review
- Data retention compliance check (are deletion jobs running correctly?)
- Incident response tabletop

**Annual:**
- Full internal security audit against ISO 27001 controls
- DPDP compliance self-assessment against all Rules
- RoPA review and update
- Third-party vendor due diligence refresh

### 17.2 External Audit & Testing

| Activity | Frequency | Provider |
|----------|-----------|---------|
| Penetration test (web + API + mobile) | Annual | CERT-In empanelled firm |
| Cloud configuration audit | Annual | CERT-In empanelled firm or cloud security specialist |
| ISO 27001 surveillance audit | Annual | NABCB accredited certification body |
| ISO 27001 recertification audit | Every 3 years | NABCB accredited certification body |
| PCI DSS SAQ A | Annual | Internal (SAQ A is self-assessed) |
| VAPT (on-demand) | After major features / architecture changes | CERT-In empanelled firm |
| Bug bounty programme | Ongoing | HackerOne / Bugcrowd / private |

### 17.3 CERT-In Empanelled Auditors

For mandatory security audits use only CERT-In empanelled Information Security Auditing Organisations (ISAOs). The current list is published at cert-in.org.in/empanelled-organizations. Re-verify the list before engaging — it is updated periodically.

---

## 18. Master Compliance Checklist

### Data Protection & Privacy
- [ ] DPDP Data Fiduciary obligations mapped; legal basis documented per processing activity
- [ ] DPO/Privacy Lead appointed
- [ ] Plain-language consent notice published in English, Hindi, and Gujarati
- [ ] Consent capture mechanism with versioning and immutable records
- [ ] Consent withdrawal flow (per-purpose) implemented
- [ ] Data Principal self-service rights portal (access/correct/erase)
- [ ] Grievance mechanism with 90-day SLA
- [ ] Record of Processing Activities (RoPA) maintained
- [ ] Data Protection Impact Assessments (DPIAs) completed for high-risk processing
- [ ] DPDP Rule 6 seven security safeguards implemented and evidenced
- [ ] Breach response playbook with CERT-In 6h + DPB 72h + user notice flows
- [ ] Data retention and automated erasure jobs operational
- [ ] 48-hour pre-erasure notice implemented
- [ ] Cross-border data transfers: none (data residency = India)
- [ ] Data Processing Agreements with all vendors containing DPDP flow-down clauses
- [ ] Children's data: verifiable parental consent flow or age gating
- [ ] Aadhaar Data Vault if Aadhaar numbers are stored

### Cybersecurity
- [ ] CERT-In incident reporting capability (6-hour clock)
- [ ] 180-day log retention in India (CERT-In) + 1-year total (DPDP)
- [ ] NTP synchronisation to approved NTP servers
- [ ] ISO 27001:2022 certification (or implementation in progress)
- [ ] Annual penetration test by CERT-In empanelled firm
- [ ] OWASP ASVS v4 and API Security Top 10 addressed
- [ ] OWASP MASVS v2 compliance for mobile app
- [ ] Vulnerability management programme with documented SLAs
- [ ] Security incident response team and on-call rota

### Real Estate / RERA
- [ ] RERA registration number displayed on all new project listings
- [ ] GujRERA QR code included in all listing pages and advertisements (since June 2025)
- [ ] Agent RERA registration numbers captured and displayed
- [ ] GujRERA.gujarat.gov.in verification integrated for new projects
- [ ] No misleading advertising claims in listing content
- [ ] RERA complaint routing mechanism
- [ ] Developer quarterly update data sourced from GujRERA API

### Payments (PCI DSS + RBI)
- [ ] Razorpay merchant KYC completed
- [ ] Hosted checkout only (iframe/redirect) — SAQ A scope maintained
- [ ] Webhook signature verification implemented
- [ ] Server-side payment verification (Order Status API) before order fulfilment
- [ ] No raw card data ever touches your servers
- [ ] Razorpay tokenisation for saved cards
- [ ] PCI DSS SAQ A completed annually
- [ ] Requirements 6.4.3 (script inventory) and 11.6.1 (change detection) documented
- [ ] CSP blocking all non-Razorpay scripts on payment-adjacent pages

### Telecom / Communications
- [ ] DLT registration as Principal Entity
- [ ] All SMS headers/sender IDs registered
- [ ] All SMS templates registered and approved before use
- [ ] All URLs in SMS whitelisted on DLT portal
- [ ] DND compliance check before all commercial communications
- [ ] WhatsApp Business API: user opt-in captured; template-only messages
- [ ] Voice call time restrictions enforced (9 AM–9 PM for promotional)

### Consumer Protection
- [ ] Legal name, registered address, CIN, GSTIN displayed on platform
- [ ] Grievance Officer named and contact published
- [ ] Complaint acknowledgement within 48 hours; resolution within 1 month
- [ ] Seller/agent undertaking and verification
- [ ] Sponsored/featured listings clearly labelled "Sponsored"
- [ ] Refund/cancellation policy published
- [ ] Consent not pre-ticked; explicit affirmative action required

### Tax Compliance
- [ ] GST registered; GSTIN obtained and displayed
- [ ] GST collected at 18% on platform service fees; monthly returns filed
- [ ] GST TCS deducted at 1% if marketplace model; GSTR-8 filed
- [ ] Section 194O TDS deducted at 0.1% on e-commerce payouts; Form 26Q filed
- [ ] Section 194-IA (buyer's 1% TDS on property purchase ≥ ₹50L) — displayed as buyer information
- [ ] Payment records retained for 8 years

### IT Law / Intermediary
- [ ] Terms of Service published; IP licence grant from users
- [ ] Privacy Policy published; DPDP-compliant
- [ ] IT Amendment Rules 2026 compliance: 3-hour takedown capability, 7-day grievance resolution
- [ ] AI-generated content labelled with disclosure and metadata
- [ ] Safe harbour conditions met: due diligence maintained, no active participation in unlawful content

### International / Voluntary Standards
- [ ] ISO 27001:2022 certification roadmap in place
- [ ] ISO 27701 roadmap (after ISO 27001)
- [ ] NIST CSF 2.0 framework adopted as governance structure
- [ ] CIS Controls v8 IG1 implemented as baseline
- [ ] WCAG 2.2 Level AA accessibility audit completed for web
- [ ] GuDApps accessibility compliance for mobile app

### Governance
- [ ] Named DPO / Privacy Lead
- [ ] Named CISO / Security Lead
- [ ] Named Grievance Officer (India-resident)
- [ ] Security governance cadence established (monthly/quarterly reviews)
- [ ] Risk register maintained and reviewed quarterly
- [ ] Staff security awareness training programme (quarterly minimum)
- [ ] Vendor risk assessment programme
- [ ] Bug bounty programme or responsible disclosure policy published
- [ ] Business continuity plan and DR runbook tested

---

## Appendix A: Key Regulatory Contacts

| Authority | Contact | Purpose |
|-----------|---------|---------|
| CERT-In | incident@cert-in.org.in | Mandatory breach reporting |
| Data Protection Board of India | (appointed post-Nov 2025) | DPDP breach reports; Data Principal complaints |
| GujRERA | gujrera.gujarat.gov.in | RERA verification, complaints |
| TRAI | dnd.trai.gov.in; DLT portal | DLT registration, DND compliance |
| FIU-IND | fiu.gov.in | AML/STR reporting (if applicable) |
| RBI | rbi.org.in | Payment system queries |
| Competition Commission of India | cci.gov.in | Competition law queries |
| Consumer Forum | consumerhelpline.gov.in | Consumer complaints |

---

## Appendix B: Key Indian Laws Quick Reference

| Law | Year | Regulator | Your Primary Obligation |
|-----|------|-----------|------------------------|
| DPDP Act | 2023 | Data Protection Board | Data fiduciary obligations; breach reporting |
| IT Act | 2000 | MeitY / CERT-In | Cybersecurity; intermediary obligations |
| IT (Intermediary) Rules | 2021 (amended 2026) | MeitY | Grievance officer; content moderation; AI labelling |
| RERA Act | 2016 | GujRERA (Gujarat) | RERA number display; agent registration |
| Consumer Protection Act | 2019 | CCPA / Consumer Forums | Grievance; fair practices; disclosures |
| PMLA | 2002 | FIU-IND / ED | AML; STR filing (if applicable) |
| GST Acts (CGST/SGST/IGST) | 2017 | GSTN / GST Council | GST registration; returns; TCS |
| Income Tax Act | 1961 | CBDT | TDS (194O, 194IA); tax returns |
| FEMA | 1999 | RBI | Foreign exchange; NRI property rules |
| Competition Act | 2002 (amended 2023) | CCI | Fair competition; no abuse of dominance |
| TRAI TCCCPR | 2018 (amended 2025) | TRAI | DLT registration; DND compliance |
| Aadhaar Act | 2016 | UIDAI | eKYC licensing; data vault obligations |
| Copyright Act | 1957 | Copyright Office | IP licence from users; content rights |
| RPwD Act | 2016 | DEPwD | Accessibility compliance |

---

*This document is a technical and operational reference guide. It is not legal advice. All regulatory interpretations, applicability thresholds, and compliance positions should be validated with qualified Indian legal counsel specialising in data protection, real estate law, and financial regulation before implementation or launch. Regulatory landscape is current as of June 2026; monitor for updates, especially DPDP Board guidance, GujRERA circulars, and RBI notifications.*

*Maintained by: Security & Compliance Team*  
*Review cycle: Quarterly*  
*Next review: September 2026*
