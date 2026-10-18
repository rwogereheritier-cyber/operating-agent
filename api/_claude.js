// Backend-only: the real Claude extraction call. Never bundled into the frontend
// (the API key stays server-side). Used by api/extract.js when ANTHROPIC_API_KEY is set.
import { EXTRACTION_TOOL, EXTRACTION_SYSTEM_PROMPT } from '../src/lib/extraction/contract.js';

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

export async function claudeExtract(message) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('no_api_key');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: 'tool', name: EXTRACTION_TOOL.name },
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!res.ok) throw new Error(`claude_http_${res.status}`);
  const data = await res.json();
  const toolUse = (data.content || []).find((b) => b.type === 'tool_use');
  if (!toolUse) throw new Error('no_tool_use_in_response');
  return toolUse.input; // conforms to the extraction contract; validated by the caller
}
