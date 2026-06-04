// Lightweight client for AION brain endpoints
export async function think(input, context = {}) {
  const res = await fetch('/api/brain/think', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, context }),
  });
  if (!res.ok) throw new Error('Brain think request failed: ' + res.status);
  return res.json();
}

export async function status() {
  const res = await fetch('/api/brain/status');
  if (!res.ok) throw new Error('Brain status request failed: ' + res.status);
  return res.json();
}

export async function emotion(text) {
  const res = await fetch('/api/brain/emotion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Brain emotion request failed: ' + res.status);
  return res.json();
}

export async function dailyReflection(periodDays = 7) {
  const res = await fetch('/api/brain/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ period: periodDays }),
  });
  if (!res.ok) throw new Error('Brain reflection request failed: ' + res.status);
  return res.json();
}

export async function suggestSelfUpgrade() {
  const res = await fetch('/api/brain/self-upgrade-plan', { method: 'POST' });
  if (!res.ok) throw new Error('Brain self-upgrade request failed: ' + res.status);
  return res.json();
}
