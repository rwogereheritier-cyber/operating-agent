// Code-enforced guardrails. These are the product's spine.
// Each is a plain function the server calls on every relevant action.
// The LLM can be wrong or be manipulated by a crafted customer message;
// these cannot be bypassed because they live below the model, in the app logic.

// G1 — No unverified price in an offer.
// An offer line item may cite a supplier price ONLY if that supplier enquiry
// is marked verified === true. This is "never invent a price" made mechanical.
export function assertOfferPricesVerified(offer, supplierEnquiries) {
  const byId = new Map(supplierEnquiries.map((e) => [e._id, e]));
  for (const li of offer.lineItems) {
    const e = byId.get(li.sourceEnquiryId);
    if (!e || e.verified !== true) {
      throw new Error(
        `G1 blocked: line item "${li.desc}" cites an unverified or missing supplier enquiry ` +
          `(${li.sourceEnquiryId || 'none'}). An offer cannot carry a price we have not verified.`
      );
    }
  }
  return true;
}

// G2 — Approval gate. No offer reaches the customer without a human stamp.
export function assertApprovedBeforeSend(offer) {
  if (!offer.approvedBy || !offer.approvedAt) {
    throw new Error(
      'G2 blocked: offer cannot be marked "sent" without approvedBy + approvedAt. ' +
        'The operator approves every binding offer.'
    );
  }
  return true;
}

// G4 — Data-access scoping. Every read is scoped to one operator (+ one customer
// for history). This both prevents cross-customer leakage and neutralizes a
// prompt-injected message trying to reach another customer's records.
export function scopedFilter(operatorId, customerId) {
  if (!operatorId) throw new Error('G4 blocked: a query with no operatorId is never allowed.');
  const f = { operatorId };
  if (customerId) f.customerId = customerId;
  return f;
}

export function assertSameOperator(record, operatorId) {
  if (!record || record.operatorId !== operatorId) {
    throw new Error('G4 blocked: cross-operator access denied.');
  }
  return true;
}

// G7 — Plausibility block. A request with an unresolved critical plausibility flag
// (e.g. a budget far below any market price for the model) cannot advance to an
// offer until the operator acknowledges it.
export function hasBlockingPlausibility(request) {
  return (request.plausibilityFlags || []).some((f) => f.critical);
}
