# Security — Document Index

**Project:** Prop Unified  
**Owner:** Shreyas Vivek  
**Classification:** Internal — Security & Compliance Team  

This folder contains all security governance, risk, compliance, and architecture documentation for the Prop Unified platform.

---

## Documents

| File | Purpose | Primary Audience | Review Cadence |
|------|---------|-----------------|----------------|
| [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) | Complete regulatory landscape — every law, rule, and standard the platform must comply with | Legal, Compliance, Leadership | Quarterly |
| [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | Security architecture, design principles, implementation patterns, vulnerability inventory | Engineering, Security | Per feature, or quarterly |
| [INCIDENT_RESPONSE_RUNBOOK.md](./INCIDENT_RESPONSE_RUNBOOK.md) | Step-by-step incident response playbooks, pre-written notification templates, escalation matrix | Engineering, On-call | Print + keep offline. Drill quarterly |
| [RISK_REGISTER.md](./RISK_REGISTER.md) | Living risk register — all identified risks scored, treated, and owned | CISO, Leadership | Quarterly review |
| [DEVELOPER_SECURITY_CHECKLIST.md](./DEVELOPER_SECURITY_CHECKLIST.md) | Security checklist for every PR, every new endpoint, every new integration | All engineers | Before every PR merge |
| [DATA_FLOW_REGISTER.md](./DATA_FLOW_REGISTER.md) | DPDP Record of Processing Activities (RoPA), data flows, processor inventory | DPO, Legal, Compliance | Quarterly or on new data processing |

---

## Quick Links by Situation

**"We have a security incident"** → [INCIDENT_RESPONSE_RUNBOOK.md](./INCIDENT_RESPONSE_RUNBOOK.md)

**"I'm building a new feature"** → [DEVELOPER_SECURITY_CHECKLIST.md](./DEVELOPER_SECURITY_CHECKLIST.md) then [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)

**"We need to answer a compliance question"** → [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md)

**"We're doing a quarterly risk review"** → [RISK_REGISTER.md](./RISK_REGISTER.md)

**"A user asked what data we hold about them"** → [DATA_FLOW_REGISTER.md](./DATA_FLOW_REGISTER.md)

**"A regulator asked for our data processing activities"** → [DATA_FLOW_REGISTER.md](./DATA_FLOW_REGISTER.md)

---

## Document Ownership

| Role | Responsibility |
|------|---------------|
| CISO / Security Lead | SECURITY_ARCHITECTURE.md, RISK_REGISTER.md |
| DPO / Privacy Lead | SECURITY_COMPLIANCE.md, DATA_FLOW_REGISTER.md |
| On-call Lead | INCIDENT_RESPONSE_RUNBOOK.md |
| All Engineers | DEVELOPER_SECURITY_CHECKLIST.md |

---

*All documents in this folder are version-controlled in git. The diff history is the change log.*
