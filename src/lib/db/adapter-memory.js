// In-memory storage adapter — the fallback when no MONGODB_URI is set, and the
// backend used by headless tests. Same interface as the Mongoose adapter.
export function memoryAdapter() {
  const store = new Map(); // collection -> Map(_id -> doc)
  let seq = 0;
  const col = (c) => { if (!store.has(c)) store.set(c, new Map()); return store.get(c); };
  const matches = (doc, filter) => Object.entries(filter).every(([k, v]) => String(doc[k]) === String(v));

  return {
    kind: 'memory',
    async insert(c, doc) {
      const _id = doc._id || `${c}_${++seq}`;
      const saved = { ...doc, _id };
      col(c).set(_id, saved);
      return { ...saved };
    },
    async find(c, filter = {}) {
      return [...col(c).values()].filter((d) => matches(d, filter)).map((d) => ({ ...d }));
    },
    async findOne(c, filter = {}) {
      const hit = [...col(c).values()].find((d) => matches(d, filter));
      return hit ? { ...hit } : null;
    },
    async updateById(c, id, patch) {
      const cur = col(c).get(id);
      if (!cur) return null;
      const next = { ...cur, ...patch };
      col(c).set(id, next);
      return { ...next };
    },
  };
}
