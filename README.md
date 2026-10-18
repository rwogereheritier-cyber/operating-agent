# AI Operating Agent — control-layer core

Competition prototype (Dubai "Create AI Agents Championship" — Best Business AI Agent).
An operating system for independent service operators: it turns messy customer
enquiries into structured, tracked, **approval-controlled** deals, and it
**never fabricates** prices, stock, availability, supplier responses, or customer
history, and **never commits money without a human**.

This folder is the defensible heart, built framework-agnostic so it drops cleanly
into the serverless backend next.

## What runs today (no API key, no database)

```
npm run demo      # or: node demo.mjs
```

It feeds three real Experiment-A messages through the pipeline and proves the two
guardrails that matter most.

## Layout

- `src/domain/states.js` — the deal state machine; only legal transitions pass.
- `src/domain/request.js` — extraction contract → persisted request record(s);
  handles multi-intent split (one message → one `intakeId` → N requests).
- `src/domain/guardrails.js` — the guardrails enforced **in code, below the model**:
  - **G1** no unverified price in an offer
  - **G2** approval before an offer can be sent
  - **G4** every query scoped to one operator (+ customer) — blocks cross-customer
    leakage and prompt-injected data exfiltration
  - **G7** a critical plausibility flag blocks progress to an offer
- `demo.mjs` — the runnable proof above.

## Build sequence (where this sits)

1. **Domain core + guardrails ← you are here (runs now)**
2. Live extraction via Claude API → structured request *(needs an Anthropic API key)*
3. Persistence: MongoDB Atlas + Mongoose, append-only audit log *(needs an Atlas URI)*
4. Offer builder + approval-gate endpoint + UI (the demo's dramatic beat)
5. Operator UI (React/Vite/Tailwind), fresh repo, deploy to Vercel

## Ground rules this build keeps

Never fabricate. Human approval before any binding offer. Guardrails in code, not
prompts. One workflow done flawlessly before any breadth.
