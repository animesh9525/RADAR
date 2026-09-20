import { normalizeBlock } from './blocks';

export const BLOCK_STORAGE_KEY = 'aiabps_blocks';
export const APPROVAL_STORAGE_KEY = 'aiabps_approvals';
export const AUDIT_STORAGE_KEY = 'aiabps_audit';
export const DATASOURCE_STORAGE_KEY = 'aiabps_datasource';

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* ignore */ }
}

export function saveBlocksToStorage(blocks) {
  const payload = {};
  (blocks || []).forEach(b => { payload[b.id] = normalizeBlock(b); });
  safeSet(BLOCK_STORAGE_KEY, payload);
}

export function loadBlocksFromStorage() {
  const raw = safeGet(BLOCK_STORAGE_KEY);
  if (!raw || typeof raw !== 'object') return null;
  const out = [];
  Object.keys(raw).forEach(k => {
    try { out.push(normalizeBlock(Object.assign({}, raw[k], { id: k }))); } catch (e) { /* ignore */ }
  });
  return out;
}

export function saveApprovalsToStorage(approvals) {
  safeSet(APPROVAL_STORAGE_KEY, approvals || {});
}

export function loadApprovals() {
  const raw = safeGet(APPROVAL_STORAGE_KEY);
  return (raw && typeof raw === 'object') ? raw : {};
}

export function saveAuditToStorage(records) {
  safeSet(AUDIT_STORAGE_KEY, records || []);
}

export function loadAudit() {
  const raw = safeGet(AUDIT_STORAGE_KEY);
  return Array.isArray(raw) ? raw : [];
}

export function saveDataSource(label, importedAt) {
  safeSet(DATASOURCE_STORAGE_KEY, { label: label || 'Synthetic Demo Dataset', importedAt: importedAt || null });
}

export function loadDataSource() {
  const raw = safeGet(DATASOURCE_STORAGE_KEY);
  if (raw && raw.label) return raw;
  return { label: 'Synthetic Demo Dataset', importedAt: null };
}