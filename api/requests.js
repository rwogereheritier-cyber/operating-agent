// Serverless endpoint for requests.
//  POST { message }           -> extract + persist request(s) + audit, returns them
//  GET  ?operatorId=...       -> list that operator's requests (scoped)
import { getRepo } from '../src/lib/db/repo.js';
import { validateExtraction } from '../src/lib/extraction/contract.js';
import { stubExtract } from '../src/lib/extraction/stub.js';
import { claudeExtract } from './_claude.js';

export default async function handler(req, res) {
  const repo = await getRepo();
  const operatorId = (req.query && req.query.operatorId) || (req.body && req.body.operatorId) || 'op_demo';

  if (req.method === 'GET') {
    return res.status(200).json({ requests: await repo.listRequests(operatorId), backend: repo.backend });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const message = (req.body && req.body.message) || '';
  if (!message.trim()) return res.status(400).json({ error: 'empty_message' });

  let extraction;
  try { extraction = process.env.ANTHROPIC_API_KEY ? await claudeExtract(message) : stubExtract(message); }
  catch { extraction = stubExtract(message); }

  const check = validateExtraction(extraction);
  if (!check.ok) return res.status(422).json({ error: 'contract_violation', details: check.errors });

  const customerId = (req.body && req.body.customerId) || 'cust_demo';
  const created = await repo.createRequests(extraction, { operatorId, customerId });
  return res.status(201).json({ created, backend: repo.backend });
}
