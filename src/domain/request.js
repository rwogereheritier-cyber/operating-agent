// Turns an extraction-contract object (what the Claude API returns per inbound
// message) into one or more persisted request records.
// Multi-intent is handled here: one inbound message -> one intakeId -> N requests.

import { STATES } from './states.js';

let seq = 0;
const nextRequestId = () => `REQ-${String(++seq).padStart(4, '0')}`;

export function resetSequence() {
  seq = 0;
}

export function buildRequests(extraction, { operatorId, customerId }) {
  if (!operatorId) throw new Error('buildRequests: operatorId is required.');
  const intakeId = extraction.intake_id || `INT-${Date.now()}`;
  const detected = extraction.detected_requests || [];

  return detected.map((d) => {
    const missing = d.missing_critical_fields || [];
    const plausibilityFlags = (d.plausibility_flags || []).map((p) =>
      typeof p === 'string' ? { note: p, critical: true } : p
    );

    // Initial status is derived, never guessed: a blocking plausibility flag
    // holds the request; otherwise missing critical info means we must ask;
    // otherwise it is ready to source.
    let status;
    if (plausibilityFlags.some((f) => f.critical)) status = STATES.BLOCKED;
    else if (missing.length) status = STATES.NEEDS_INFO;
    else status = STATES.SOURCING;

    return {
      requestId: nextRequestId(),
      operatorId,
      customerId: customerId || null,
      intakeId,
      serviceType: d.service_type || 'unclear',
      requirements: d.requirements || {},
      attributes: d.attributes || [],
      currency: d.currency || 'AED',
      currencyConfirmed: d.currency_confirmed === true,
      missingCriticalFields: missing,
      clarifyingQuestions: d.clarifying_questions || [],
      plausibilityFlags,
      requiresSupplierVerification: d.requires_supplier_verification || [],
      inventedClaims: d.invented_claims || [], // must always be empty; audited
      status,
      createdAt: new Date().toISOString(),
    };
  });
}
