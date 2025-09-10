// src/utils/streamParse.js
// Utility: consume a ReadableStream (Fetch reader) robustly.
// Supports NDJSON (newline-separated JSON objects) and plain text streaming.
// Usage example:
//   import { streamToLines } from './utils/streamParse';
//   const reader = res.body.getReader();
//   for await (const msg of streamToLines(reader)) { /* msg is a string */ }

export async function* streamToLines(reader) {
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // split on newlines
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop(); // last may be incomplete
    for (const line of lines) {
      if (!line) continue;
      yield line;
    }
  }
  if (buffer) yield buffer;
}

// Helper to parse NDJSON lines safely into JSON objects (returns null if not JSON)
export function safeParseJSONLine(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

// Convenience: reads a fetch Response and returns full text (fallback)
export async function readFullText(reader) {
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
  }
  buffer += decoder.decode();
  return buffer;
}