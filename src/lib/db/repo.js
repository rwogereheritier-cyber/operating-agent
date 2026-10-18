// The repository: all data access goes through here. It enforces, in code:
//  - data-access scoping (every read takes operatorId; cross-operator returns null) — G4
//  - append-only audit (there is NO updateAudit/deleteAudit method) — G3
//  - no unverified price in an offer — G1 (reuses the domain guardrail)
//  - approval before send — G2 (reuses the domain guardrail)
import { buildRequests } from '../../domain/request.js';
import { assertOfferPricesVerified, assertApprovedBeforeSend, scopedFilter, assertSameOperator } from '../../domain/guardrails.js';
import { memoryAdapter } from './adapter-memory.js';

export async function getRepo() {
  let adapter;
  if (process.env.MONGODB_URI) {
    const { mongooseAdapter } = await import('./adapter-mongoose.js'); // dynamic: never bundled client-side
    adapter = await mongooseAdapter();
  } else {
    adapter = memoryAdapter();
  }
  return new Repo(adapter);
}

class Repo {
  constructor(adapter) { this.a = adapter; this.backend = adapter.kind; }

  async _audit(operatorId, requestId, actor, action, payload = {}) {
    return this.a.insert('auditLog', { operatorId, requestId, actor, action, payload, timestamp: new Date().toISOString() });
  }

  async createRequests(extraction, { operatorId, customerId }) {
    const reqs = buildRequests(extraction, { operatorId, customerId });
    const out = [];
    for (const r of reqs) {
      const saved = await this.a.insert('requests', r);
      await this._audit(operatorId, saved.requestId, 'agent', 'request_created', { status: saved.status });
      out.push(saved);
    }
    return out;
  }

  async listRequests(operatorId) { return this.a.find('requests', scopedFilter(operatorId)); }

  async getRequest(operatorId, requestId) {
    const r = await this.a.findOne('requests', { operatorId, requestId });
    return r; // scoped: another operator's id simply never matches
  }

  async logSupplierEnquiry(operatorId, requestId, data) {
    const req = await this.getRequest(operatorId, requestId);
    if (!req) throw new Error('G4 blocked: request not found for this operator.');
    const e = await this.a.insert('supplierEnquiries', { operatorId, requestId, sentAt: new Date().toISOString(), ...data });
    await this._audit(operatorId, requestId, 'operator', 'supplier_response_logged', { supplierEnquiryId: e._id, verified: !!data.verified });
    return e;
  }

  async buildOffer(operatorId, requestId, { lineItems, operatorFee = 0, currency = 'AED' }) {
    const req = await this.getRequest(operatorId, requestId);
    if (!req) throw new Error('G4 blocked: request not found for this operator.');
    const enqs = await this.a.find('supplierEnquiries', { operatorId, requestId });
    const offer = { operatorId, requestId, lineItems, operatorFee, currency, status: 'draft', approvedBy: null, approvedAt: null };
    assertOfferPricesVerified(offer, enqs); // G1 — throws if any line cites an unverified enquiry
    offer.supplierCost = lineItems.reduce((s, li) => s + (li.cost || 0), 0);
    offer.total = offer.supplierCost + operatorFee;
    const saved = await this.a.insert('offers', offer);
    await this._audit(operatorId, requestId, 'agent', 'offer_drafted', { offerId: saved._id, total: saved.total });
    return saved;
  }

  async approveOffer(operatorId, offerId, approver) {
    const o = await this.a.findOne('offers', { operatorId, _id: offerId });
    if (!o) throw new Error('G4 blocked: offer not found for this operator.');
    const upd = await this.a.updateById('offers', offerId, { approvedBy: approver, approvedAt: new Date().toISOString(), status: 'approved' });
    await this._audit(operatorId, o.requestId, 'operator', 'offer_approved', { offerId, by: approver });
    return upd;
  }

  async sendOffer(operatorId, offerId) {
    const o = await this.a.findOne('offers', { operatorId, _id: offerId });
    if (!o) throw new Error('G4 blocked: offer not found for this operator.');
    assertApprovedBeforeSend(o); // G2 — throws unless approvedBy + approvedAt exist
    const upd = await this.a.updateById('offers', offerId, { status: 'sent' });
    await this._audit(operatorId, o.requestId, 'agent', 'offer_sent', { offerId });
    return upd;
  }

  async listAudit(operatorId, requestId) {
    return this.a.find('auditLog', requestId ? { operatorId, requestId } : scopedFilter(operatorId));
  }
  // There is deliberately NO updateAudit / deleteAudit. Append-only is enforced by
  // the absence of any mutating path — tamper-evidence by construction.
}
