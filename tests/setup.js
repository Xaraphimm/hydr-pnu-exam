import '@testing-library/jest-dom';

// Node 22+ ships a built-in localStorage stub that lacks setItem/getItem/removeItem/clear
// when --localstorage-file is not provided. This overrides it with a spec-compliant
// in-memory implementation so jsdom-based tests work correctly.
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); },
    get length() { return store.size; },
    key(index) { return [...store.keys()][index] ?? null; },
  };
}
