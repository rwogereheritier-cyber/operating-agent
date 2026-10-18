// Serverless endpoint: GET ?operatorId=...&requestId=... -> the append-only audit log.
// Read-only by design; there is no POST/PUT/DELETE here.
import { getRepo } from '../src/lib/db/repo.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const repo = await getRepo();
  const operatorId = (req.query && req.query.operatorId) || 'op_demo';
  const requestId = req.query && req.query.requestId;
  return res.status(200).json({ audit: await repo.listAudit(operatorId, requestId), backend: repo.backend });
}
