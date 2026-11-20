/* =========================================================
   worker.js — The assistant's small server (Cloudflare Worker).
   The app sends a question + today's data here.
   This server adds the secret Gemini key and asks Gemini.
   The key never reaches the browser.
   ========================================================= */

// Only these sites may use the assistant (so nobody else uses up the free quota)
const ALLOWED = [
  'https://nawafnag.github.io',
  'http://localhost:8765',
  'http://127.0.0.1:8765',
];

// If one free model is busy, try the next one
// (flash-lite is the fastest, so it goes first)
const MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest'];

const RULES = `You are "Muadh's Helper", a kind assistant inside a school app called
"Muadh Lost and Found". The app tracks students' belongings at 4 checkpoints:
home morning, school entry, school exit, home afternoon. Items can be missing,
and teachers post found items on a Lost & Found board.
- Answer ONLY from the app data you are given. If the data does not say, say you do not know.
- Never invent students, items or dates.
- Keep answers short (1-4 sentences), simple and friendly, for parents, teachers and children.
- Answer in the language requested. In Arabic, write names in Arabic letters only
  (use the Arabic name from the data, e.g. سارة), never mix in other alphabets.
- Only talk about the app and school belongings. Politely refuse other topics.`;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function reply(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors(origin)),
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED.includes(origin)) return new Response('Not allowed', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'POST') return reply({ error: 'method' }, 405, origin);
    if (!env.GEMINI_API_KEY) return reply({ error: 'nokey' }, 500, origin);

    let input;
    try { input = await request.json(); } catch (e) { return reply({ error: 'json' }, 400, origin); }

    const question = String(input.question || '').slice(0, 500);
    const context = String(input.context || '').slice(0, 12000);
    const lang = input.lang === 'en' ? 'English' : 'Arabic';
    if (!question.trim()) return reply({ error: 'empty' }, 400, origin);

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: RULES }] },
      contents: [{
        role: 'user',
        parts: [{ text: 'App data:\n' + context + '\n\nAnswer in ' + lang + '.\nQuestion: ' + question }],
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    });

    let gemini = null;
    const tried = [];
    for (const model of MODELS) {
      const started = Date.now();
      try {
        gemini = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
          { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
            body, signal: AbortSignal.timeout(15000) }); // wait at most 15 seconds per model
      } catch (e) {
        gemini = new Response('timeout', { status: 504 });
      }
      tried.push(model + ':' + gemini.status + ':' + (Date.now() - started) + 'ms');
      if (gemini.ok) break;
      // 400 / 401 / 403 = a problem with the key or request: other models will not help
      if (![404, 429, 500, 503, 504].includes(gemini.status)) break;
    }

    if (!gemini.ok) {
      const detail = await gemini.text().catch(() => '');
      return reply({ error: 'gemini', status: gemini.status, tried, detail: detail.slice(0, 300) }, 502, origin);
    }
    const result = await gemini.json();
    const parts = (result.candidates && result.candidates[0] && result.candidates[0].content
      && result.candidates[0].content.parts) || [];
    const answer = parts.map(p => p.text || '').join('').trim();
    return reply({ answer: answer || '' }, 200, origin);
  },
};
