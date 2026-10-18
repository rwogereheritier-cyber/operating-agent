# BUILD-SPEC.md — technical blueprint

The concrete "what to build," referenced by CLAUDE.md. Distilled from the Project Book and the
Data Model & Guardrails v1 / Agent Spec working files.

## 1. Architecture
Control layer below the model. The Claude API reads an inbound message and drafts structured output;
Node serverless functions validate, persist, and gate every consequential action. The LLM may call
only a server-side tool whitelist; its output is never trusted to move money or change approval state.

```
inbound message ──▶ extraction (Claude API, schema-structured)
                      │
                      ▼
            requests (persisted)  ──▶ supplierEnquiries (verified flag)
                      │                        │
                      ▼                        ▼
               offer builder (G1) ──▶ approval gate (G2) ──▶ send (simulated)
                      │
                      ▼
            outcome + reconciliation ; auditLog appended on every transition (G3)
```

## 2. Data model (MongoDB collections)
operators, customers (per-operator history boundary), requests (requirements + attributes + currency +
missingCriticalFields + plausibilityFlags + status), supplierEnquiries (response + verifiedPrice +
availability + verified bool), offers (lineItems[{desc, sourceEnquiryId, cost}] + supplierCost +
operatorFee + total + status + approvedBy + approvedAt), auditLog (append-only), reconciliation
(expected/received commission + flag).

## 3. State machine
NEW → NEEDS_INFO → SOURCING → OFFER_DRAFT → AWAITING_APPROVAL → SENT → ACCEPTED → IN_PROGRESS →
COMPLETED → COMMISSION_PENDING → RECONCILED. Branches: DECLINED, BLOCKED, CLOSED, SPLIT.
Transitions enforced in code (see src/domain/states.js in v0).

## 4. Code-enforced guardrails
- G1 no unverified price in an offer (line item must cite a `verified === true` supplierEnquiry)
- G2 approval gate (status cannot become `sent` without approvedBy + approvedAt)
- G3 append-only auditLog (no update/delete route)
- G4 data-access scoping (every query scoped to operatorId [+ customerId]; blocks leakage & injection)
- G5 tool authorization (LLM calls only a server-side whitelist; customer text is untrusted data)
- G6 multi-intent split (one message → one intakeId → N linked requests)
- G7 plausibility block (a critical flag holds a request before OFFER_DRAFT)

## 5. Extraction output contract (schema the model must return)
One inbound message → `intake_id` + `detected_requests[]`, each with: service_type; requirements
{make, model, year, condition, budget, destination, timeline, quantity}; attributes[{key,value}];
currency + currency_confirmed; missing_critical_fields[]; clarifying_questions[]; plausibility_flags[];
requires_supplier_verification[]; invented_claims[] (must be empty); confidence. Plus detected_language.
Inferred values (e.g. make from model) are labelled inferred, never presented as confirmed.

## 6. Design-system token contract
CSS custom properties are the source of truth and map 1:1 into Tailwind v4 `@theme`:
surface set (bg, surface, surface-2, border, border-strong), ink (ink, ink-muted, ink-subtle),
brand (brand, brand-ink, brand-weak, on-brand), semantic (ok, warn, danger, info — each + -weak),
radius (sm/base/lg), shadow, fonts (ui = Hanken Grotesk, mono = IBM Plex Mono). Light + dark defined
at :root with the three-state theme pattern (system via prefers-color-scheme, explicit via data-theme).

## 7. Repo structure (target)
```
/CLAUDE.md
/docs/BUILD-SPEC.md
/src/domain/        states.js, guardrails.js, request.js   (framework-agnostic core — v0, done)
/src/theme/         tokens.css, tailwind theme
/src/components/    Button, Field, Card, StatusPill, VerificationMarker, ApprovalPanel, DataTable
/src/features/request-workspace/   the first end-to-end workflow screens
/api/               serverless endpoints (extract, requests, suppliers, offers, approve, audit)
/src/lib/           mongoose models, claude client
```

## 8. First end-to-end workflow — build increments
1. Theme: tokens.css + Tailwind v4 @theme; the 7 primitives from the design system.
2. Request Workspace shell wired to the v0 domain core (states + guardrails) with in-memory data.
3. Extraction endpoint (Claude API, the §5 contract) → persists a request. [needs ANTHROPIC_API_KEY]
4. MongoDB persistence + append-only auditLog on every transition. [needs MONGODB_URI]
5. Supplier-enquiry logging (simulated, labelled) + offer builder (G1).
6. Approval gate UI + endpoint (G2) — records approver + timestamp to audit.
7. Outcome + reconciliation to prototype depth; simulated inbound + demo script; deploy to Vercel.

## 9. Simulated vs real (prototype honesty)
Simulated and clearly labelled: supplier responses, sending to the customer, inbound WhatsApp.
Real: extraction (once API key wired), the domain core, guardrails, persistence, approval, audit.
Never imply a simulated action was actually performed.
