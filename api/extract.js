// Serverless endpoint: POST { message } -> validated extraction.
// Uses the real Claude call when ANTHROPIC_API_KEY is set, else the labelled stub.
// Every result is validated against the contract; a no-invention violation is rejected.
import { validateExtraction } from '../src/lib/extraction/contract.js';
import { stubExtract } from '../src/lib/extraction/stub.js';
import { claudeExtract } from './_claude.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const message = (req.body && req.body.message) || '';
  if (!message.trim()) return res.status(400).json({ error: 'empty_message' });

  let extraction;
  let source = 'stub';
  try {
    if (process.env.ANTHROPIC_API_KEY) { extraction = await claudeExtract(message); source = 'claude'; }
    else extraction = stubExtract(message);
  } catch (e) {
    // live call failed — fall back to the safe stub, never to invented data
    extraction = stubExtract(message);
    source = 'stub_fallback:' + e.message;
  }

  const check = validateExtraction(extraction);
  if (!check.ok) {
    // never return unvalidated / fabricated output to the client
    return res.status(422).json({ error: 'contract_violation', details: check.errors, source });
  }
  return res.status(200).json({ ...extraction, _source: source });
}
