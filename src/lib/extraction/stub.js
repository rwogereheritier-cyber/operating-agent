// Deterministic stub extractor — used for the browser preview and headless tests
// when no Anthropic key is wired. It returns the SAME contract shape the live model
// returns, so everything downstream is identical. It never invents: an unknown
// message returns a safe "unclear / everything missing" result.

const CANNED = {
  landcruiser: {
    intake_id: 'INT-1', detected_language: 'en',
    detected_requests: [{
      service_type: 'vehicle',
      requirements: { make: 'Toyota (inferred from model)', model: 'Land Cruiser', year: null, condition: null, budget: 50000, destination: 'Lagos', timeline: 'ASAP', quantity: null },
      attributes: [], currency: 'AED', currency_confirmed: false,
      missing_critical_fields: ['year', 'condition', 'currency_confirm'],
      clarifying_questions: ['Preferred year/generation?', 'New or used, any mileage limit?', 'Confirm budget is AED 50,000?'],
      plausibility_flags: [], requires_supplier_verification: [], invented_claims: [], confidence: 'high',
    }],
  },
  patrol: {
    intake_id: 'INT-2', detected_language: 'en',
    detected_requests: [{
      service_type: 'vehicle',
      requirements: { make: 'Nissan (inferred from model)', model: 'Patrol', year: null, condition: 'black', budget: null, destination: null, timeline: null, quantity: null },
      attributes: [{ key: 'color', value: 'black' }], currency: 'AED', currency_confirmed: false,
      missing_critical_fields: ['destination', 'budget', 'timeline', 'year'],
      clarifying_questions: ['Where is it going and what is your timeline?'],
      plausibility_flags: [], requires_supplier_verification: ['availability', 'price'], invented_claims: [], confidence: 'low',
    }],
  },
};

export function stubExtract(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('land cruiser')) return CANNED.landcruiser;
  if (m.includes('patrol')) return CANNED.patrol;
  // Safe default: never invent. Everything unknown becomes an unclear request with
  // all fields missing and a clarifying question.
  return {
    intake_id: 'INT-' + Date.now(), detected_language: 'en',
    detected_requests: [{
      service_type: 'unclear',
      requirements: { make: null, model: null, year: null, condition: null, budget: null, destination: null, timeline: null, quantity: null },
      attributes: [], currency: 'AED', currency_confirmed: false,
      missing_critical_fields: ['what item/service', 'budget', 'destination'],
      clarifying_questions: ['Just to be sure I get it right — what are you looking for, and where is it going?'],
      plausibility_flags: [], requires_supplier_verification: [], invented_claims: [], confidence: 'low',
    }],
  };
}

// Map one detected_request to the UI's field rows with evidence tags.
export function toDisplayFields(d) {
  const r = d.requirements || {};
  const missing = new Set(d.missing_critical_fields || []);
  const row = (k, label, key) => {
    const raw = r[key];
    if (raw == null || missing.has(key)) return { k: label, v: null, ev: 'missing' };
    const inferred = typeof raw === 'string' && raw.includes('(inferred');
    return { k: label, v: inferred ? raw.replace(/\s*\(inferred[^)]*\)/, '') : String(raw), ev: inferred ? 'inferred' : 'stated' };
  };
  return [
    row('make', 'Make', 'make'),
    row('model', 'Model', 'model'),
    { k: 'Year', v: null, ev: missing.has('year') ? 'missing' : (r.year ? 'stated' : 'missing') },
    { k: 'Condition', v: r.condition || null, ev: r.condition ? 'stated' : 'missing' },
    row('destination', 'Destination', 'destination'),
    row('timeline', 'Timeline', 'timeline'),
  ];
}
