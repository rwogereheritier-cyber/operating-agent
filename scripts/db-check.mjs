// Headless check of the persistence layer invariants, using the in-memory backend:
// scoping (G4), append-only audit (G3), no unverified price (G1), approve-before-send (G2).
import { getRepo } from '../src/lib/db/repo.js';
import { stubExtract } from '../src/lib/extraction/stub.js';

let pass = 0, total = 0;
const ok = (name, cond) => { total++; if (cond) { pass++; console.log('PASS ' + name); } else console.log('FAIL ' + name); };

const repo = await getRepo();
console.log('backend:', repo.backend, '\n');

// create requests for operator A
const created = await repo.createRequests(stubExtract('I need a Land Cruiser under 50k for export to Lagos'), { operatorId: 'opA', customerId: 'c1' });
ok('creates a request', created.length === 1 && created[0].requestId);
const reqId = created[0].requestId;

// scoping: A sees it, B does not
ok('G4 operator A sees own request', (await repo.listRequests('opA')).length === 1);
ok('G4 operator B sees nothing', (await repo.listRequests('opB')).length === 0);
ok('G4 cross-operator get returns null', (await repo.getRequest('opB', reqId)) == null);

// G1: offer from unverified enquiry rejected; from verified accepted
const unv = await repo.logSupplierEnquiry('opA', reqId, { supplier: 'Yard A', verified: false });
let blocked = false;
try { await repo.buildOffer('opA', reqId, { lineItems: [{ desc: 'LC', sourceEnquiryId: unv._id, cost: 48000 }], operatorFee: 2000 }); }
catch { blocked = true; }
ok('G1 blocks offer citing unverified enquiry', blocked);

const ver = await repo.logSupplierEnquiry('opA', reqId, { supplier: 'Yard B', verified: true, verifiedPrice: 48000, availability: 'in stock' });
const offer = await repo.buildOffer('opA', reqId, { lineItems: [{ desc: 'LC', sourceEnquiryId: ver._id, cost: 48000 }], operatorFee: 2000 });
ok('G1 allows offer from verified enquiry', offer && offer.total === 50000);

// G2: cannot send before approval; can after
let sendBlocked = false;
try { await repo.sendOffer('opA', offer._id); } catch { sendBlocked = true; }
ok('G2 blocks send before approval', sendBlocked);
await repo.approveOffer('opA', offer._id, 'Operator A');
const sent = await repo.sendOffer('opA', offer._id);
ok('G2 allows send after approval', sent && sent.status === 'sent');

// G3: audit is append-only (no mutation methods exist) and recorded every step
ok('G3 no updateAudit method', typeof repo.updateAudit === 'undefined');
ok('G3 no deleteAudit method', typeof repo.deleteAudit === 'undefined');
const audit = await repo.listAudit('opA');
ok('G3 audit recorded each step', audit.length >= 5);

console.log(`\n${pass}/${total} invariants hold`);
process.exit(pass === total ? 0 : 1);
