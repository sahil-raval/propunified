# INCIDENT RESPONSE RUNBOOK

**Project:** Prop Unified  
**Owner:** On-Call Lead / Incident Commander  
**Version:** 1.0 — June 2026  
**Classification:** Internal — Restricted  

> **PRINT THIS DOCUMENT.** During a real incident, systems may be unavailable. A printed copy should be kept physically accessible to the on-call lead.

---

## Table of Contents

1. [On-Call & Escalation Matrix](#1-on-call--escalation-matrix)
2. [Incident Severity Classification](#2-incident-severity-classification)
3. [The Two Mandatory Clocks](#3-the-two-mandatory-clocks)
4. [General Incident Response Phases](#4-general-incident-response-phases)
5. [Playbook: Data Breach / PII Exposure](#5-playbook-data-breach--pii-exposure)
6. [Playbook: Account Takeover Campaign](#6-playbook-account-takeover-campaign)
7. [Playbook: Platform DDoS / Service Down](#7-playbook-platform-ddos--service-down)
8. [Playbook: Payment Fraud / Webhook Forgery](#8-playbook-payment-fraud--webhook-forgery)
9. [Playbook: Ransomware / Malicious Code](#9-playbook-ransomware--malicious-code)
10. [Playbook: Admin Panel Compromise](#10-playbook-admin-panel-compromise)
11. [Pre-Written Notification Templates](#11-pre-written-notification-templates)
12. [Evidence Collection Checklist](#12-evidence-collection-checklist)
13. [Post-Incident Review Template](#13-post-incident-review-template)
14. [Tabletop Exercise Scenarios](#14-tabletop-exercise-scenarios)

---

## 1. On-Call & Escalation Matrix

> Fill in before going live. Review quarterly.

| Role | Name | Primary Contact | Backup Contact |
|------|------|----------------|----------------|
| Incident Commander (Primary) | ________________ | ________________ | ________________ |
| Incident Commander (Backup) | ________________ | ________________ | ________________ |
| CISO / Security Lead | ________________ | ________________ | ________________ |
| DPO / Privacy Lead | ________________ | ________________ | ________________ |
| CTO / Engineering Lead | ________________ | ________________ | ________________ |
| Legal Counsel | ________________ | ________________ | ________________ |
| CEO | ________________ | ________________ | ________________ |
| Razorpay Emergency | 1800-123-1500 | razorpay.com/support | ________________ |
| Supabase Support | support@supabase.io | ________________ | ________________ |
| Cloudflare Support | ________________ | ________________ | ________________ |
| Exotel (proxy numbers) | ________________ | ________________ | ________________ |

**Escalation rule:** If the Incident Commander cannot be reached within 10 minutes, escalate to backup. If backup unreachable within 10 minutes, escalate to CISO.

---

## 2. Incident Severity Classification

| Severity | Criteria | Response Target | Who Is Notified |
|----------|---------|----------------|----------------|
| **P1 — Critical** | Confirmed data breach; platform fully down; ransomware; active exploit; admin panel compromise | **Immediately** — 15-minute response | All — CEO, CTO, CISO, DPO, Legal |
| **P2 — High** | Suspected breach; major feature down; ATO campaign in progress; payment fraud detected | Within **1 hour** | CISO, CTO, DPO |
| **P3 — Medium** | Non-critical vulnerability being exploited; single account compromise; service degraded | Within **4 hours** | CISO, Engineering lead |
| **P4 — Low** | Suspected anomaly; config issue; policy violation; minor bug with security implication | Within **24 hours** | Security champion |

---

## 3. The Two Mandatory Clocks

> These clocks start the **moment you become aware** of an incident — not when investigation completes.

```
T+0h   Incident detected / declared
         │
         ├──► CLOCK 1: CERT-In (6 hours)
         │     T+0h to T+1h:  Triage; Incident Commander assigned
         │     T+1h to T+4h:  Containment; draft CERT-In report
         │     T+4h to T+6h:  File CERT-In report
         │     ▼
         │     File at: incident@cert-in.org.in
         │
         └──► CLOCK 2: DPDP Board + Data Principals (72 hours)
               T+0h to T+6h:   Run parallel. Is personal data affected?
               T+6h to T+48h:  Forensic investigation; scope of PII exposure
               T+48h to T+72h: File DPB notification; send user notices
               ▼
               File at: dpb.gov.in / DPDP Board portal
               Users: SMS + in-app + email
```

**DO NOT WAIT FOR INVESTIGATION TO COMPLETE.** Send preliminary reports at the deadline. You can file a follow-up report with full details.

---

## 4. General Incident Response Phases

### Phase 1 — Detect & Declare (0–30 min)

**Trigger sources:**
- SIEM alert (automated)
- User report via support
- Third-party notification (Razorpay, Supabase, security researcher)
- Staff observation

**Steps:**
1. Acknowledge the alert / report
2. Do **not** take any action yet — observe first
3. Determine: is this a real incident, or a false positive?
   - Real indicator of compromise → declare incident, go to Phase 2
   - False positive → document, close, review alert rule
4. If incident: create incident channel in Slack: `#incident-YYYY-MM-DD-NNN`
5. Assign Incident Commander
6. Start the clocks (record T+0h timestamp)
7. Update status page: "We are aware of an issue and are investigating."
8. Do NOT post technical details publicly yet

### Phase 2 — Contain (30 min–4 hours)

**Principle: stop the bleeding before you diagnose.**

1. Isolate affected systems:
   - Cloudflare: add emergency rule to block attack IPs or user agents
   - Supabase: revoke and rotate the compromised key
   - Render: restart service with environment var changes if keys compromised
   - Clerk: revoke affected user sessions from Clerk dashboard
2. Take a forensic snapshot **before** remediation (do not destroy evidence)
3. Preserve all relevant logs to immutable storage
4. Revoke potentially compromised credentials:
   - Supabase service_role key
   - Clerk secret key
   - Razorpay webhook secret
   - Any other secrets that may have been exposed
5. Determine: what data was accessed? How many users affected?
6. Brief the Incident Commander with your findings

### Phase 3 — Notify (4–72 hours)

**CERT-In report by T+6h.** See Template A.

**DPB + user notification by T+72h** if personal data affected. See Templates B and C.

Also notify:
- Razorpay if payment data potentially affected
- Cyber insurance provider
- Legal counsel (to advise on notification scope)

### Phase 4 — Eradicate & Recover (4–72 hours)

1. Root cause identified
2. Patch deployed or compensating control in place
3. New credentials deployed (all rotated in Phase 2)
4. Enhanced monitoring deployed for this attack vector
5. Test that the eradication worked (re-probe the vector)
6. Restore service from clean backups if needed
7. Update status page when resolved

### Phase 5 — Post-Incident (within 2 weeks)

1. Full post-incident report written (use template in Section 13)
2. Lessons learned session with all stakeholders
3. Action items tracked to completion in project tracker
4. Update threat model and controls if needed
5. Consider whether to notify CERT-In with follow-up report
6. Train team on new indicators of compromise

---

## 5. Playbook: Data Breach / PII Exposure

**Triggers:** SIEM alert for large data export, enumeration pattern, user complaint about their data appearing elsewhere, security researcher report.

### Immediate Actions (0–30 min)

```
1. Do NOT share details outside the incident channel
2. Identify the likely vector:
   - API endpoint (check logs for unusual patterns: sequential IDs, high volume)
   - Database direct access (check Supabase access logs)
   - Third-party vendor breach (check vendor status pages)
3. Declare P1 if any PII confirmed exposed; P2 if suspected
4. Start clocks
```

### Containment (30 min–2 hours)

```
1. If API enumeration detected:
   → Cloudflare: block offending IP ranges immediately
   → Tighten rate limits on affected endpoints via Cloudflare rule
   → Check if the endpoint has ownership checks — if not, disable it temporarily

2. If database breach suspected:
   → Rotate Supabase service_role key immediately
   → Rotate DATABASE_URL connection string
   → Check Supabase audit logs for direct queries bypassing your API

3. If third-party breach:
   → Follow vendor's incident process
   → Document what data you shared with the vendor

4. Preserve:
   → Export relevant Supabase audit logs before rotation
   → Screenshot SIEM alerts with timestamps
   → Capture Cloudflare firewall logs
```

### Scope Assessment

```
Questions to answer for CERT-In and DPB reports:
□ What data categories were exposed? (names, phones, emails, PAN, Aadhaar, payment data)
□ Approximately how many Data Principals affected?
□ What was the likely start time of the exposure?
□ Is the exposure ongoing or contained?
□ Was data extracted (exfiltrated) or only accessed?
□ Was any payment data (card numbers, bank details) involved?
   → If yes: notify Razorpay immediately; PCI DSS breach procedure applies
```

### Notification Triggers

| Data Exposed | Action |
|-------------|--------|
| Phone/email/name | CERT-In (if ≥ 100 users or systematic); DPB notification; user notice |
| PAN number | CERT-In always; DPB notification; user notice; advise users to monitor for fraud |
| Aadhaar number | CERT-In always; DPB notification; user notice; UIDAI notification; advise virtual ID change |
| Payment data | CERT-In; DPB; user notice; Razorpay notification; PCI DSS incident process |
| KYC documents | CERT-In always; DPB notification; user notice; advise identity theft precautions |

---

## 6. Playbook: Account Takeover Campaign

**Triggers:** SIEM alert for OTP brute force (>10 OTP failures per phone in 10 min), impossible travel logins, multiple accounts logging in from same IP, user reports account accessed without their knowledge.

### Immediate Actions

```
1. Confirm it's a campaign (multiple accounts) vs single compromise
2. For campaign: declare P1 immediately

Cloudflare actions:
→ Block or challenge the source IP range(s)
→ Enable "I'm Under Attack" mode if severe
→ Require CAPTCHA on all auth endpoints

Clerk actions:
→ Revoke all active sessions for affected accounts
→ Force phone re-verification for affected users
→ Temporarily restrict new session creation from affected IPs
```

### Investigation

```
1. How were accounts compromised?
   □ OTP interception (SIM swap) — look for carrier change notifications
   □ Credential stuffing from a third-party breach
   □ Phishing (fake PropUnified login page)
   □ Malware on user device

2. What did the attacker do with compromised accounts?
   □ Changed listing contact details to attacker's number
   □ Created fraudulent listings
   □ Viewed buyer enquiries (PII exposure)
   □ Made or cancelled bookings

3. Enumerate all affected accounts; document actions taken
```

### Recovery

```
1. Lock all confirmed compromised accounts
2. Force password/OTP re-verification
3. Notify affected users (see Template C)
4. Review and revert any actions taken under compromised accounts
5. File CERT-In report (identity theft + unauthorised access = reportable)
```

---

## 7. Playbook: Platform DDoS / Service Down

**Triggers:** Status page alarms, Cloudflare analytics showing traffic spike, Render/Vercel service health check failures.

### Immediate Actions (0–15 min)

```
1. Check Cloudflare dashboard — is traffic volume anomalous?
2. Check Render/Vercel service logs — is the origin overloaded or returning errors?
3. Distinguish:
   □ DDoS (volumetric attack, high packet rate)
   □ Application-layer flood (high request rate targeting slow endpoints)
   □ Internal error causing cascading failures

For DDoS:
→ Cloudflare: enable "Under Attack" mode
→ Cloudflare: rate limit to 10 req/min per IP globally
→ Cloudflare: block top source countries if attack is geographically concentrated
→ Contact Cloudflare support for enterprise DDoS assistance

For application flood:
→ Identify the targeted endpoint from Cloudflare logs
→ Cloudflare: apply specific rate limit or block rule for that path
→ Check if the endpoint has a known vulnerability being exploited

For internal error cascade:
→ Check recent deployments — rollback if correlated
→ Check DB connection pool saturation (Supabase connections)
→ Check Render service logs for error rate spike
```

### Communication

```
T+15min: Status page: "We are experiencing elevated traffic and some services may be slow."
T+1hr:   Status page: Update with estimated resolution if known
T+resolved: Status page: "All services restored. We are monitoring."
```

**Do NOT mention DDoS publicly if avoidable** — it signals to attackers that the attack is working.

---

## 8. Playbook: Payment Fraud / Webhook Forgery

**Triggers:** SIEM alert for payment_signature_mismatch audit events, unusual pattern of premium subscriptions without corresponding revenue, user complaints about unauthorised charges.

### Immediate Actions

```
1. Check audit_log for payment_signature_mismatch events
   → If found: someone is trying to forge webhooks
   → Block their IP in Cloudflare
   → Rotate RAZORPAY_WEBHOOK_SECRET immediately

2. Check if any premium subscriptions were granted without matching Razorpay payment:
   → Query: SELECT * FROM listings WHERE is_premium = true AND premium_until > NOW()
   → Cross-reference each with Razorpay order: GET /orders/{order_id}
   → Any listing where Razorpay shows no captured payment = fraudulently promoted

3. Revert fraudulent premium grants:
   → Update listing: is_premium = false, premium_until = null
   → Notify affected "seller" that their premium was reverted (don't explain why publicly)
```

### Root Cause Investigation

```
□ Was RAZORPAY_WEBHOOK_SECRET leaked? (check git history, deployment logs, env vars)
□ Was the signature verification bypassed by a code path error?
□ Was there a replay attack (valid signature, same payload sent twice)?
   → Check idempotency key enforcement in order creation
```

### Notification

```
- Notify Razorpay of the incident via their support channel
- If user payment data was involved: CERT-In + DPB notification
- Review all payments in the last 30 days if webhook secret was compromised
```

---

## 9. Playbook: Ransomware / Malicious Code

**Triggers:** Files encrypted on a server, unusual process execution in container, SIEM alert for known malware signatures, vendor notification.

### Immediate Actions (0–30 min)

```
CRITICAL: Do not pay ransom. Do not attempt to negotiate. Contact CERT-In.

1. IMMEDIATELY isolate affected systems:
   → Render: pause/stop the affected service
   → Do NOT restart — this may propagate the malware
   → Cloudflare: put platform offline if needed (maintenance mode)

2. Snapshot the affected container/VM BEFORE any remediation (forensics)

3. Determine blast radius:
   □ Is this isolated to one service or spread to DB / storage?
   □ Has any data been exfiltrated (most ransomware exfiltrates before encrypting)?

4. Declare P1; notify CEO, CTO, CISO, Legal immediately

5. Start CERT-In clock (T+0)
```

### Recovery

```
Key insight: Because your stack is cloud-native (Vercel + Render + Supabase),
you do NOT have on-premise infrastructure to encrypt. Ransomware is most likely
to affect:
- Application code in a container
- Secrets stolen and sold
- A development workstation

Recovery steps:
1. Redeploy from clean git commit (before infection)
2. Rotate ALL credentials (all env vars, all API keys, all secrets)
3. Restore database from Supabase PITR backup to pre-infection point
4. Restore storage from S3 backup
5. Verify restore integrity before going live
6. Run full security scan on all restored services
7. Consider engaging forensic firm (if legal proceedings anticipated)
```

---

## 10. Playbook: Admin Panel Compromise

**Triggers:** Admin login from unrecognised device/country, unusual admin actions in audit log, user reports their listing was modified without their action.

### Immediate Actions (0–15 min)

```
1. Revoke the compromised admin session immediately via Clerk dashboard
2. Force all admin accounts to re-authenticate
3. Enable hardware MFA requirement for all admin accounts if not already done
4. Audit last 24 hours of admin_action audit log entries
5. Determine: was this a compromised credential or a session hijack?
```

### Damage Assessment

```
□ Were any user accounts modified (roles changed, emails/phones changed)?
□ Were any listings created, modified, or deleted by the attacker?
□ Were any KYC records accessed or modified?
□ Were any payments processed or refunded?
□ Were any new admin accounts created?
□ Were any platform configuration changes made?

For each damage item: reverse the action and notify affected users.
```

### Hardening After Incident

```
1. Review Cloudflare Zero Trust policy — tighten device posture requirements
2. Enforce hardware MFA (FIDO2/WebAuthn) for ALL admin accounts
3. Enable Privileged Session Recording for all admin actions
4. Review admin IP allowlist — restrict to office/VPN IPs
5. Audit all admin accounts — remove any that are not actively needed
```

---

## 11. Pre-Written Notification Templates

> These templates require legal review before first use. Keep updated versions approved by legal counsel.

---

### Template A — CERT-In Initial Report (6-hour deadline)

**To:** incident@cert-in.org.in  
**Subject:** Cybersecurity Incident Report — Prop Unified — [DATE] — [INCIDENT-ID]

```
ORGANISATION DETAILS
Organisation Name: Prop Unified / [Legal Entity Name]
Sector: E-Commerce / Real Estate Technology
Website: propunified.in
Point of Contact Name: [INCIDENT COMMANDER NAME]
Point of Contact Phone: [PHONE]
Point of Contact Email: [EMAIL]

INCIDENT DETAILS
Incident Type: [Select from CERT-In 20 categories — e.g., "Data breach" / "Unauthorised access"]
Date/Time Detected: [ISO 8601 timestamp with timezone]
Date/Time of Incident (estimated start): [if known]
Systems Affected: [e.g., "API server, user profile database"]
Services Affected: [e.g., "Property listing platform, user authentication"]

DESCRIPTION
[2–3 paragraph description of what happened, what was detected, and immediate actions taken]

DATA INVOLVED
Was personal data affected: Yes / No / Unknown
Estimated number of persons affected: [number or range, e.g., "approximately 500" or "unknown, under investigation"]
Categories of personal data: [e.g., "Name, phone number, email address"]

CURRENT STATUS
Incident contained: Yes / No / Partial
Actions taken so far: [bullet list of containment actions]

This is an initial report. A detailed follow-up report will be filed within 72 hours.

[NAME]
[TITLE]
[ORGANISATION]
[DATE AND TIME]
```

---

### Template B — Data Protection Board Notification (72-hour deadline)

**Submit via:** DPB portal (dpb.gov.in) once operational

```
DATA FIDUCIARY DETAILS
Name: Prop Unified / [Legal Entity Name]
Registration/CIN: [CIN]
Registered Address: [ADDRESS]
Data Protection Officer: [DPO NAME, EMAIL, PHONE]

BREACH DETAILS

1. Nature of the personal data breach:
[Describe: what happened, how it was discovered, what systems were involved]

2. Categories of personal data involved:
[e.g., "Phone numbers, email addresses, property enquiry history"]
[If applicable: "Financial data — payment reference numbers (no card numbers)"]
[If applicable: "Identity documents — PAN numbers (encrypted; encryption may have been bypassed)"]

3. Approximate number of Data Principals affected:
[number]

4. Approximate number of personal data records affected:
[number]

5. Likely consequences of the breach:
[e.g., "Affected users may receive unsolicited marketing calls; identity theft risk if PAN/Aadhaar involved"]

6. Measures taken or proposed:
a. Immediate containment: [list actions taken]
b. Ongoing investigation: [what is being investigated]
c. Remediation: [patches, credential rotation, security improvements]
d. Recurrence prevention: [controls being implemented]

7. Contact for further information:
[DPO name, email, phone]

8. Have affected Data Principals been notified: Yes / No / Partial
[If yes: describe the notification method and content]
[If no: explain the reason for delay]

Date of this report: [DATE]
Time of initial awareness of breach: [DATE AND TIME]
```

---

### Template C — Data Principal Notification (SMS — plain language)

**Send via:** DLT-registered sender ID

```
[ENGLISH VERSION]
Dear [NAME/Valued User],

We are writing to inform you of a security incident that may have affected your account on PropUnified.

What happened: [One sentence — plain language, e.g., "On [DATE], we discovered that contact information of some users may have been accessed without authorisation."]

What data may be involved: [e.g., "Your phone number and name registered with us."]

What we have done: We have secured the breach, rotated all system credentials, and are working with security experts.

What you should do:
- Be alert for unexpected calls or messages claiming to be from PropUnified
- If you receive suspicious contact, do not share any financial information
- You can update your contact details at propunified.in/settings

If you have questions: Call us at [HELPLINE] or email privacy@propunified.in

We are sorry this occurred. Your trust is our priority.

PropUnified Team
```

```
[SHORT SMS VERSION — 160 characters max]
PropUnified security notice: Your account data may have been affected. Stay alert for suspicious calls. Details: propunified.in/security-notice
```

```
[HINDI VERSION]
प्रिय [नाम/मूल्यवान उपयोगकर्ता],

हम आपको PropUnified पर एक सुरक्षा घटना के बारे में सूचित कर रहे हैं जो आपके खाते को प्रभावित कर सकती है।

क्या हुआ: [एक वाक्य — सरल भाषा में]

कौन सा डेटा प्रभावित हो सकता है: [जैसे "आपका फोन नंबर और नाम"]

हमने क्या किया: हमने सुरक्षा उल्लंघन को रोक दिया है और सिस्टम सुरक्षित कर दिया है।

आप क्या करें:
- किसी भी अनजान कॉल या संदेश से सावधान रहें
- कोई भी वित्तीय जानकारी साझा न करें
- अपनी जानकारी अपडेट करें: propunified.in/settings

प्रश्नों के लिए: [हेल्पलाइन] या privacy@propunified.in
```

```
[GUJARATI VERSION]
પ્રિય [નામ/મૂલ્યવાન વપરાશકર્તા],

અમે આપને PropUnified પર એક સુરક્ષા ઘટના વિશે જાણ કરવા ઇચ્છીએ છીએ.

શું થયું: [એક વાક્ય — સ્પષ્ટ ભાષામાં]

કયો ડેટા અસર પામ્યો હોઈ શકે: [જેમ કે "આપનો ફોન નંબર અને નામ"]

અમે શું કર્યું: અમે સુરક્ષા ઉલ્લંઘન બંધ કર્યું છે અને સિસ્ટમ સુરક્ષિત કર્યું છે.

આપ શું કરો:
- અજાણ્યા કૉલ અથવા સંદેશાઓ પ્રત્યે સાવધ રહો
- કોઈ નાણાકીય માહિતી શેર ન કરો
- propunified.in/settings પર આપની માહિતી અપડેટ કરો

પ્રશ્નો માટે: [હેલ્પલાઇન] અથવા privacy@propunified.in
```

---

### Template D — Razorpay Notification

**Send to:** Razorpay account team + razorpay.com/support

```
Subject: Security Incident Notification — Merchant [YOUR_MERCHANT_ID]

Dear Razorpay Trust & Safety Team,

We are writing to notify you of a security incident that may involve payment data processed through our Razorpay integration.

Incident summary: [One paragraph]

Our Razorpay integration details:
- Merchant ID: [ID]
- Integration type: [Hosted checkout / Payment Links]
- Payment data potentially affected: [Yes/No — specify if order IDs or payment IDs were exposed]
- Card data involved: No (we use hosted checkout; no card data touches our servers)

Actions taken: [List]

We request your assistance in: [e.g., "reviewing transactions from [date range] for any anomalous activity"]

Contact: [Name, email, phone]
```

---

## 12. Evidence Collection Checklist

> Collect this evidence BEFORE making any changes to affected systems.

```
□ Cloudflare
  □ Firewall events export (filtered to incident time range)
  □ Analytics: top IPs, request volume, status codes
  □ Worker/Function logs if applicable

□ Render (API Server)
  □ Application logs (pino-http output) — download and preserve
  □ Environment variables list (names only, not values) — screenshot
  □ Deployment history screenshot

□ Supabase
  □ Audit log export (Settings → Audit Logs) for affected tables
  □ Database query logs if available
  □ Auth logs (all login events for affected period)
  □ Storage access logs if file storage involved

□ Clerk
  □ Session logs for affected user accounts
  □ Login history (IP addresses, devices, timestamps)
  □ Webhook delivery logs

□ SIEM / Audit Log Table
  □ Export audit_log rows for the incident time range
  □ Include: actorId, eventType, resourceId, outcome, occurredAt, actorIpHash

□ Application Metrics
  □ API response time graphs (to establish baseline vs anomaly)
  □ Error rate charts
  □ Database connection pool saturation charts

□ Git / Deployment
  □ Last 10 deployment records with timestamps and commit SHAs
  □ Most recent 20 commits to main branch

Document:
□ T+0h: exact time and source of incident detection
□ First observed indicator of compromise
□ Timeline of all actions taken during response
□ Names of all personnel involved in response
```

---

## 13. Post-Incident Review Template

> Complete within 2 weeks of incident closure.

```
POST-INCIDENT REVIEW
Incident ID: INC-[YYYY]-[NNN]
Date of incident: [DATE]
Date of this review: [DATE]
Participants: [LIST]
Facilitator: [INCIDENT COMMANDER]

1. INCIDENT SUMMARY
   What happened (2-3 sentences, non-technical):
   [...]

   Timeline:
   T+0h [TIME]:  [What happened]
   T+Xh [TIME]:  [Detection]
   T+Xh [TIME]:  [Containment action]
   T+Xh [TIME]:  [CERT-In report filed]
   T+Xh [TIME]:  [Service restored]
   T+Xh [TIME]:  [DPB notification filed, if applicable]

2. ROOT CAUSE ANALYSIS (5-Why)
   Why did this happen?
   → [1st Why]
   → [2nd Why]
   → [3rd Why]
   → [4th Why]
   → [5th Why — root cause]

3. IMPACT
   Users affected: [number]
   Data categories exposed: [list]
   Service downtime: [duration]
   Revenue impact: [estimate]
   Regulatory impact: [CERT-In filed, DPB filed, user notices sent]

4. WHAT WENT WELL
   [List 3–5 things the team did well]

5. WHAT WENT POORLY
   [List 3–5 things that slowed response or increased impact]

6. DID WE MEET THE CLOCKS?
   CERT-In 6-hour clock:   MET / MISSED (by [X] hours)
   DPB 72-hour clock:      MET / MISSED (by [X] hours) / NOT APPLICABLE
   User notices:           SENT / NOT SENT / PENDING

7. ACTION ITEMS
   | Action | Owner | Priority | Deadline |
   |--------|-------|---------|---------|
   | [...]  | [...] | P1      | [DATE]  |

8. CONTROLS TO ADD / UPDATE
   [List any new security controls to be added as a result of this incident]

9. THREAT MODEL UPDATES
   [Does this incident reveal a new threat or attack vector not in the current threat model?]

10. FOLLOW-UP CERT-IN / DPB REPORT NEEDED?
    Yes / No
    If yes: [Person responsible, deadline]
```

---

## 14. Tabletop Exercise Scenarios

> Run one of these quarterly. Rotate scenarios. Involve the full on-call team.

**Format:** 90 minutes. Facilitator reads scenario aloud. Team talks through response without using real systems. Evaluator scores against playbook steps.

---

### Scenario 1 — The Silent Data Leak

*It's 2:00 AM. Your SIEM fires an alert: a single user account has called `POST /properties/*/contact` 847 times in the last 4 hours. The account was created 3 days ago. Logs show the account hit 847 different property IDs sequentially.*

**Discussion questions:**
1. What is your first action?
2. At what point do you declare an incident and what severity?
3. How do you determine if the phone numbers were actually harvested?
4. Do you trigger the CERT-In clock? Why or why not?
5. Do you need to notify users? How many?
6. How long before you can answer: "exactly how many users were affected"?

---

### Scenario 2 — The Admin Account Hijack

*A Monday morning. Your CISO gets an email from a user: "Why did your support team update my listing price without asking me?" You check the audit log and find 47 listing updates in the past 12 hours — all attributed to your admin user "admin@propunified.in". You call the admin. They haven't logged in since Friday.*

**Discussion questions:**
1. How do you immediately contain the damage?
2. The attacker had admin access for ~60 hours. What is the maximum possible damage?
3. How do you inventory what the attacker actually did?
4. Do you need to notify users whose listings were modified?
5. How do you tell users "your listing was modified by an attacker" without causing panic?
6. Is this a CERT-In reportable incident?

---

### Scenario 3 — The Aadhaar Exposure

*You receive an email from an anonymous sender with a proof-of-concept: they have successfully extracted 15 Aadhaar numbers from your API by exploiting a BOLA vulnerability in `GET /kyc/:id`. They attach a text file with the first 4 digits of 15 Aadhaar numbers (enough to make the claim plausible without exposing the full numbers). They claim to have ~2,000 more. They have not made any demands.*

**Discussion questions:**
1. First instinct: reply? Ignore? Forward to legal immediately?
2. Is this a CERT-In reportable incident before you've confirmed it internally?
3. What is the blast radius if the claim is true?
4. Aadhaar numbers are involved — does this trigger UIDAI notification?
5. How do you patch without alerting the researcher that you've confirmed their finding?
6. Draft the user notification for someone whose Aadhaar number was exposed.

---

### Scenario 4 — The Razorpay Webhook Replay

*On a Thursday afternoon, your SIEM fires: `payment_signature_mismatch` — 1 event. Then nothing for an hour. Then 3 more in rapid succession. Then your platform head calls: "Why do we have 12 new premium listings that nobody paid for?"*

**Discussion questions:**
1. How quickly can you determine if the webhook secret was leaked vs brute-forced?
2. What do you do about the 12 fraudulently promoted listings?
3. Do you notify the "sellers" whose listings got a free premium boost?
4. Razorpay notification — what do you tell them?
5. Is this a CERT-In reportable incident?
6. How do you prevent this in code going forward?

---

*Review and update this runbook after every incident and after every tabletop exercise.*  
*Last reviewed: June 2026*
