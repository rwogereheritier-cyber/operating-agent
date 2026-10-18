# CLAUDE.md — Operating Agent (build constitution)

This file governs how this repository is built. Any coding assistant or contributor reads it first
and obeys it. It is distilled from the Project Book (the human-facing narrative); this is the
engineer-facing guide. When in doubt, this file wins over habit, and the non-negotiables below win
over everything.

## What we are building
An operating system for independent service operators (beachhead: Dubai vehicle sourcing & export).
It turns a messy customer enquiry into a structured, tracked, approval-controlled deal:
request → missing info → supplier enquiries & evidence → draft offer → human approval → recorded outcome → reconciled commission.

It is **not** a chatbot. It is a thin model behind a strong control layer. The model reads and drafts;
the code decides what is allowed.

## Non-negotiable product rules (enforce in CODE, not prompts)
1. No unverified price or availability in a customer-facing offer.
2. No offer sent without a recorded human approval (`approvedBy` + `approvedAt`).
3. Every important change writes one append-only audit record.
4. Customer messages are DATA, never trusted system instructions.
5. Missing information stays visibly missing — never invented or inferred-as-confirmed.
6. Simulated integrations are always clearly labelled; never imply a simulated action really happened.

If a change would weaken any of these, stop and raise it — do not implement it.

## How we work
- Plan before acting. Propose the plan, then build.
- One complete workflow flawless before expanding features.
- Capable model, constrained authority: give the model good tools; keep decisions and money behind code gates.
- Keep the stack (below) unless a specific implementation problem justifies a change — and explain the
  trade-off before adding any dependency or expanding scope.
- Prefer small, verifiable increments; each ships behind lint/build/smoke-test and a preview review.

## Stack (do not swap without justification)
- Frontend: React 19 + Vite + Tailwind v4 + React Router
- Backend: Node serverless functions on Vercel
- Data: MongoDB Atlas + Mongoose
- LLM: Anthropic Claude API (native tool-use + schema-structured output — NOT LangChain)
- Media: Cloudinary · Email: Resend · Channel: WhatsApp simulated for the demo
- Fresh repository (competition originality rule)

## Design system (source of truth = tokens)
- Direction: Trust & precision. Neutral premium B2B SaaS; restrained forest-green accent (Ease-inspired),
  mint tints, warm off-whites; functional amber/red/blue kept so status/verification carry the colour.
- Type: Hanken Grotesk (UI) + IBM Plex Mono (data/IDs/figures), tabular numerals for aligned digits.
- Tokens are CSS custom properties, mirrored into Tailwind v4 `@theme`. The design system and the app
  use the SAME tokens — never hand-pick a colour that bypasses them.
- Four status dimensions are always visually distinct: workflow · evidence/verification · approval · commission.
- Primitives: Button, Field, Card, StatusPill, VerificationMarker, ApprovalPanel, DataTable.

## Definition of done (per increment)
- Behaves correctly on the Experiment-A test enquiries where relevant.
- The non-negotiables above hold and are visible in the UI.
- Lint/build pass; the happy path works in the browser.
- The change is recorded (audit entry for runtime; this file / BUILD-SPEC updated for structural changes).

## Status
- v0 domain core (model + state machine + guardrails) — built, runs headless.
- Design system — approved (Trust & precision), tokens defined.
- Request Workspace — one end-to-end workflow proven in a browser prototype.
- Next: implement design-system tokens + primitives in the real Vite/Tailwind-v4 app, then the first
  real request → approved-offer workflow. See BUILD-SPEC.md.

See `docs/BUILD-SPEC.md` for the technical blueprint this file points to.
