// Runnable proof of the defensible core — no API key, no database needed.
// It feeds three real Experiment-A messages through the pipeline and then
// demonstrates the two guardrails that matter most: price verification and the
// approval gate.
//
// The stub extractor below returns the EXACT structured shapes we already
// validated in Experiment A. In the next build step a Claude API call produces
// these; everything downstream of it is identical, which is the whole point —
// the guardrails live below the model.

import { STATES, assertTransition } from './src/domain/states.js';
import { buildRequests } from './src/domain/request.js';
import {
  assertOfferPricesVerified,
  assertApprovedBeforeSend,
  hasBlockingPlausibility,
} from './src/domain/guardrails.js';

const OPERATOR = 'op_demo';

// append-only audit trail (in memory for the demo)
const auditLog = [];
const audit = (requestId, actor, action, payload = {}) =>
  auditLog.push({ requestId, actor, action, payload, at: new Date().toISOString() });

const samples = [
  {
    msg: 'I need a Land Cruiser under 50k for export to Lagos, as soon as possible.',
    extraction: {
      intake_id: 'INT-1',
      detected_language: 'en',
      detected_requests: [
        {
          service_type: 'vehicle',
          requirements: { make: 'Toyota (inferred from model)', model: 'Land Cruiser', year: null, condition: null, budget: 50000, destination: 'Lagos', timeline: 'ASAP', quantity: null },
          attributes: [],
          currency: 'AED',
          currency_confirmed: false,
          missing_critical_fields: ['year', 'condition', 'currency_confirm'],
          clarifying_questions: ['Preferred year/generation?', 'New or used, any mileage limit?', 'Confirm budget is AED 50,000?'],
          plausibility_flags: [],
          requires_supplier_verification: [],
          invented_claims: [],
          confidence: 'high',
        },
      ],
    },
  },
  {
    msg: 'Is the black Patrol still available? How much total?',
    extraction: {
      intake_id: 'INT-2',
      detected_language: 'en',
      detected_requests: [
        {
          service_type: 'vehicle',
          requirements: { make: 'Nissan (inferred)', model: 'Patrol', year: null, condition: 'black', budget: null, destination: null, timeline: null, quantity: null },
          attributes: [{ key: 'color', value: 'black' }],
          currency: 'AED',
          currency_confirmed: false,
          missing_critical_fields: ['destination', 'budget', 'timeline', 'year'],
          clarifying_questions: ['Where is it going and what is your timeline?'],
          plausibility_flags: [],
          requires_supplier_verification: ['availability', 'price'],
          invented_claims: [],
          confidence: 'low',
        },
      ],
    },
  },
  {
    msg: 'cheap SUV + spare parts for a Hiace + maybe a 2BR apartment in Deira.',
    extraction: {
      intake_id: 'INT-3',
      detected_language: 'en',
      detected_requests: [
        { service_type: 'vehicle', requirements: { model: '(unspecified SUV)', budget: null, destination: null }, attributes: [{ key: 'price', value: 'cheap' }], currency: 'AED', currency_confirmed: false, missing_critical_fields: ['make/model', 'budget', 'destination'], clarifying_questions: ['SUV budget and destination?'], plausibility_flags: [], requires_supplier_verification: [], invented_claims: [], confidence: 'medium' },
        { service_type: 'goods', requirements: { item: 'Hiace spare parts' }, attributes: [], currency: 'AED', currency_confirmed: false, missing_critical_fields: ['which parts', 'quantity'], clarifying_questions: ['Which Hiace parts?'], plausibility_flags: [], requires_supplier_verification: [], invented_claims: [], confidence: 'medium' },
        { service_type: 'property', requirements: { location: 'Deira', bedrooms: 2 }, attributes: [], currency: 'AED', currency_confirmed: false, missing_critical_fields: ['rent or buy', 'budget', 'dates'], clarifying_questions: ['2BR in Deira: rent or buy, and budget?'], plausibility_flags: [], requires_supplier_verification: [], invented_claims: [], confidence: 'medium' },
      ],
    },
  },
];

const line = () => console.log('-'.repeat(64));
console.log('AI OPERATING AGENT — core pipeline demo (no secrets, in-memory)');
line();

let landCruiserReq = null;

for (const s of samples) {
  console.log(`\nINBOUND: "${s.msg}"`);
  const requests = buildRequests(s.extraction, { operatorId: OPERATOR, customerId: 'cust_1' });
  console.log(`  intake split into ${requests.length} request(s):`);
  for (const r of requests) {
    audit(r.requestId, 'agent', 'request_created', { status: r.status });
    const invented = r.inventedClaims.length;
    console.log(`   • ${r.requestId} [${r.serviceType}] -> ${r.status}`);
    if (r.requiresSupplierVerification.length)
      console.log(`       needs supplier verification: ${r.requiresSupplierVerification.join(', ')} (no price/availability invented)`);
    if (r.missingCriticalFields.length)
      console.log(`       will ask: ${r.clarifyingQuestions.join(' / ')}`);
    console.log(`       invented claims: ${invented} ${invented === 0 ? '(clean)' : '(!!)'} · currencyConfirmed: ${r.currencyConfirmed}`);
    if (r.serviceType === 'vehicle' && r.requirements.model === 'Land Cruiser') landCruiserReq = r;
  }
}

line();
console.log('\nGUARDRAIL DEMO — price verification + approval gate');
console.log(`(using ${landCruiserReq.requestId}, the Land Cruiser request)\n`);

// move it along its legal path to sourcing
assertTransition(landCruiserReq.status, STATES.SOURCING); // NEEDS_INFO -> SOURCING is legal
landCruiserReq.status = STATES.SOURCING;
audit(landCruiserReq.requestId, 'operator', 'info_completed_moved_to_sourcing');

// 1) Attempt an offer citing an UNVERIFIED supplier enquiry -> must be blocked
const unverified = [{ _id: 'se_1', requestId: landCruiserReq.requestId, supplier: 'Yard A', verified: false }];
const offerBad = { lineItems: [{ desc: 'Toyota Land Cruiser', sourceEnquiryId: 'se_1', cost: 48000 }] };
try {
  assertOfferPricesVerified(offerBad, unverified);
  console.log('  ✗ FAIL: an unverified price slipped into an offer');
} catch (e) {
  console.log('  ✓', e.message);
}

// 2) Log a VERIFIED supplier enquiry, build the offer -> passes price check
const verified = [{ _id: 'se_2', requestId: landCruiserReq.requestId, supplier: 'Yard B', verified: true, verifiedPrice: 48000, availability: 'in stock' }];
audit(landCruiserReq.requestId, 'operator', 'supplier_response_logged', { supplierEnquiryId: 'se_2', verified: true });
const offer = {
  lineItems: [{ desc: 'Toyota Land Cruiser 2019', sourceEnquiryId: 'se_2', cost: 48000 }],
  supplierCost: 48000, serviceFee: 2000, total: 50000, currency: 'AED',
  status: 'draft', approvedBy: null, approvedAt: null,
};
assertOfferPricesVerified(offer, verified);
console.log('  ✓ offer passes price check — every line backed by a verified supplier');

// 3) Attempt to SEND without approval -> must be blocked
try {
  assertApprovedBeforeSend(offer);
  console.log('  ✗ FAIL: offer sent without approval');
} catch (e) {
  console.log('  ✓', e.message);
}

// 4) Operator approves -> send is allowed
offer.approvedBy = 'Operator';
offer.approvedAt = new Date().toISOString();
offer.status = 'approved';
assertApprovedBeforeSend(offer);
audit(landCruiserReq.requestId, 'operator', 'offer_approved', { by: offer.approvedBy });
console.log('  ✓ operator approved → offer may now be sent');

line();
console.log(`\nAudit entries written this run: ${auditLog.length} (append-only; every step is traceable)`);
console.log('Core holds: nothing fabricated, nothing sent without a human. ✅\n');
