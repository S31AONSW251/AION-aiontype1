// src/services/searchService.js
export async function runSearch(query) {
  const results = await fetchResultsFromAPI(query);

  return results.map((r) => ({
    ...r,
    category: categorizeResult(r), // <-- classify result
  }));
}

function categorizeResult(result) {
  const title = (result.title || "").toLowerCase();
  const snippet = (result.snippet || "").toLowerCase();

  if (title.includes("arxiv") || snippet.includes("doi"))
    return "Research Papers";
  if (snippet.includes("tutorial") || snippet.includes("how to"))
    return "Tutorials & Guides";
  if (snippet.includes("forum") || snippet.includes("reddit") || snippet.includes("discussion"))
    return "Community / Forums";
  if (snippet.includes("news") || title.includes("daily") || title.includes("times"))
    return "News & Articles";
  if (snippet.includes("tool") || snippet.includes("github"))
    return "Tools / Resources";

  return "Other";
}

async function fetchResultsFromAPI(query) {
  const response = await fetch('/api/advanced-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Search failed: ${response.status}`);
  }

  return Array.isArray(data.results) ? data.results : [];
}
