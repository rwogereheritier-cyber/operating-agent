// Mongoose storage adapter — used when MONGODB_URI is set. Loaded dynamically so
// mongoose is never pulled into the frontend bundle. Same interface as memory.
import mongoose from 'mongoose';

const schemas = {
  operators: new mongoose.Schema({ name: String, email: String, serviceFeeRules: Object, defaultCurrency: String }, { timestamps: true, strict: false }),
  customers: new mongoose.Schema({ operatorId: String, name: String, channel: String, handle: String, language: String }, { timestamps: true, strict: false }),
  requests: new mongoose.Schema({ requestId: String, operatorId: String, customerId: String, intakeId: String, serviceType: String, requirements: Object, attributes: Array, currency: String, currencyConfirmed: Boolean, missingCriticalFields: Array, clarifyingQuestions: Array, plausibilityFlags: Array, requiresSupplierVerification: Array, inventedClaims: Array, status: String }, { timestamps: true, strict: false }),
  supplierEnquiries: new mongoose.Schema({ operatorId: String, requestId: String, supplier: String, response: String, verifiedPrice: Number, availability: String, verified: Boolean, sentAt: String }, { timestamps: true, strict: false }),
  offers: new mongoose.Schema({ operatorId: String, requestId: String, lineItems: Array, supplierCost: Number, operatorFee: Number, total: Number, currency: String, status: String, approvedBy: String, approvedAt: String }, { timestamps: true, strict: false }),
  auditLog: new mongoose.Schema({ operatorId: String, requestId: String, actor: String, action: String, payload: Object, timestamp: String }, { timestamps: false, strict: false }),
  reconciliation: new mongoose.Schema({ operatorId: String, requestId: String, expectedCommission: Number, receivedCommission: Number, variance: Number, flag: String }, { timestamps: true, strict: false }),
};

let models = null;
let conn = null;

async function ensure() {
  if (!conn) {
    conn = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
    await conn;
    models = Object.fromEntries(Object.entries(schemas).map(([k, s]) => [k, mongoose.models[k] || mongoose.model(k, s)]));
  }
}

export async function mongooseAdapter() {
  await ensure();
  const M = (c) => models[c];
  return {
    kind: 'mongoose',
    async insert(c, doc) { const d = await M(c).create(doc); return d.toObject(); },
    async find(c, filter = {}) { return M(c).find(filter).lean(); },
    async findOne(c, filter = {}) { return M(c).findOne(filter).lean(); },
    async updateById(c, id, patch) { return M(c).findByIdAndUpdate(id, patch, { new: true }).lean(); },
  };
}
