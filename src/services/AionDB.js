// src/services/AionDB.js
// Minimal persistence API used by aion-memory.js - localStorage fallback.
// If you want IndexedDB, replace with Dexie implementation.

const MEM_KEY = "aion_memories_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(MEM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("AionDB read error", e);
    return [];
  }
}

function writeAll(arr) {
  try {
    localStorage.setItem(MEM_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("AionDB write error", e);
  }
}

export const db = {
  async memoriesAdd(record) {
    const all = readAll();
    // assign simple incremental id
    const id = (all.length ? (all[all.length-1].id || 0) + 1 : 1);
    const item = { id, ...record };
    all.push(item);
    writeAll(all);
    return item;
  },
  async memoriesToArray() {
    return readAll();
  },
  async memoriesDelete(id) {
    let all = readAll();
    all = all.filter(m => m.id !== id);
    writeAll(all);
    return true;
  },
  async memoriesClear() {
    writeAll([]);
    return true;
  }
};