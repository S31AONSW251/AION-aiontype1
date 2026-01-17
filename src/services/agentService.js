import modelService from './modelService';

async function queryRag(query, top_k = 4) {
  try {
    const res = await fetch('/api/rag/query', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ query, top_k }) });
    if (!res.ok) return [];
    const j = await res.json();
    if (j && j.ok && Array.isArray(j.results)) return j.results;
    return [];
  } catch (err) {
    console.warn('RAG query failed', err);
    return [];
  }
}

async function planTask(taskDescription, opts = {}) {
  const contextResults = await queryRag(taskDescription, opts.top_k || 4);
  const contextText = contextResults.map(r => `${r.metadata?.source||''}: ${r.text || ''}`).join('\n---\n');
  const prompt = `You are a planning agent.
  Task: ${taskDescription}
  Relevant memories and context:\n${contextText}\n\nCreate a concise, ordered 3-step plan (each step short) to accomplish this task.`;

  let planText = '';
  await modelService.generateStreaming({ prompt }, ({ type, data }) => {
    if (type === 'text') planText += data;
  });

  // naive parsing of numbered steps
  const steps = planText.split(/\n|\r/).map(l => l.trim()).filter(Boolean).map(l => l.replace(/^\d+\.\s*/, ''));
  return { raw: planText, steps };
}

async function executePlan(steps = [], opts = {}) {
  const results = [];
  for (const step of steps) {
    try {
      let out = '';
      await modelService.generateStreaming({ prompt: `Execute step: ${step}. Provide expected actions & short result.` }, ({ type, data }) => { if (type === 'text') out += data; });
      results.push({ step, result: out });
    } catch (err) {
      results.push({ step, error: String(err) });
    }
  }
  return results;
}

export default { planTask, executePlan };
