import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import * as demo from '../data/demoData';
import { normalizeBlock } from '../services/blocks';
import * as storage from '../services/storage';
import { normBundle, diValidate, applyBundleToState } from '../services/import';
import { recordApproval, makeAudit, pushAudit } from '../services/approval';
import { aiBuildOptimizedPlan, aiPlanMetrics } from '../services/optimization';
import { createSimulationCopy } from '../services/whatif';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const SOURCE_DEMO = 'synthetic_demo';

export function withSource(src) {
  return (items) => (Array.isArray(items) ? items : Object.keys(items).map(k => items[k])).map(it => ({ ...it, source: src || SOURCE_DEMO }));
}

function buildDemoState() {
  const taskData = { ...demo.DEMO_DATA.taskData };
  const blockMap = demo.DEMO_DATA.blockData || {};
  const blocks = Object.keys(blockMap).map(k => ({ ...normalizeBlock({ ...blockMap[k], id: k }), source: SOURCE_DEMO }));
  const tasks = Object.keys(taskData).map(k => ({ ...taskData[k], id: k, source: SOURCE_DEMO }));
  const trains = withSource(SOURCE_DEMO)(demo.DEMO_DATA.trainSchedule);
  const crew = withSource(SOURCE_DEMO)(demo.DEMO_DATA.crewData);
  const equipment = withSource(SOURCE_DEMO)(demo.DEMO_DATA.equipmentData);
  const assets = withSource(SOURCE_DEMO)(demo.DEMO_DATA.demoAssets || demo.DEMO_DATA.DEMO_SNAPSHOT.demoAssets || []);
  return { taskData, blocks, tasks, trains, crew, equipment, assets };
}

const TICKETS = [
  { title: 'Track defect at Km 12.4 — safety critical', corridor: 'C1', priority: 'CRITICAL', status: 'Reported' },
  { title: 'Signalling interlock test required', corridor: 'C2', priority: 'HIGH', status: 'In Progress' },
  { title: 'OHE sagging between S2 and S3', corridor: 'C3', priority: 'MEDIUM', status: 'Reported' },
  { title: 'Level crossing gate fault', corridor: 'C4', priority: 'HIGH', status: 'Approved' },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useLocalStorage('aiabps_theme', 'light');
  const [datasource, setDatasource] = useState(() => {
    const d = storage.loadDataSource();
    return d;
  });

  const demoBoot = useRef(buildDemoState());

  const [taskData, setTaskData] = useState(demoBoot.current.taskData);
  const [blocks, setBlocks] = useState(demoBoot.current.blocks);
  const [tasks, setTasks] = useState(demoBoot.current.tasks);
  const [trains, setTrains] = useState(demoBoot.current.trains);
  const [crew, setCrew] = useState(demoBoot.current.crew);
  const [equipment, setEquipment] = useState(demoBoot.current.equipment);
  const [assets, setAssets] = useState(demoBoot.current.assets);
  const [blockData, setBlockData] = useState(() => {
    const m = {};
    demoBoot.current.blocks.forEach(b => { m[b.id] = JSON.parse(JSON.stringify(b)); });
    return m;
  });

  const [approvals, setApprovals] = useState(() => storage.loadApprovals());
  const [auditRecords, setAuditRecords] = useState(() => storage.loadAudit());
  const [notifications, setNotifications] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(() => taskDataIds(demoBoot.current.taskData));
  const [approvalSelection, setApprovalSelection] = useState([]);

  const [whatIf, setWhatIf] = useState({ original: null, modified: null, lastResult: null, candidates: [], selectedCandidateIdx: 0, validationErrors: '' });
  const [aiDemo, setAiDemo] = useState({ plan: null, changes: null, metrics: null, applied: false, status: '' });

  const [toasts, setToasts] = useState([]);
  const [aiRunState, setAiRunState] = useState({ active: false, label: '', steps: [] });

  const demoRef = useRef(demo);
  const storedBlocks = useRef(storage.loadBlocksFromStorage());

  // ----- hydration from storage (faithful to legacy hydrateBlockData) -----
  React.useEffect(() => {
    const stored = storedBlocks.current;
    if (stored && Array.isArray(stored) && stored.length) {
      setBlocks(stored.map(b => ({ ...normalizeBlock(b), source: SOURCE_DEMO })));
    }
  }, []);

  // ----- theme side effect -----
  React.useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const session = useMemo(() => ({
    taskData, trainSchedule: trains, blocks,
    approvals, auditRecords, currentUser: user ? user.name : 'Demo Planner',
  }), [taskData, trains, blocks, approvals, auditRecords, user]);

  // ----- toast helpers -----
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // ----- auth -----
  const login = useCallback((name, role) => {
    setUser({ name, role });
    showToast(`Welcome, ${name}`, 'success');
  }, [showToast]);

  const logout = useCallback(() => {
    setUser(null);
    showToast('Signed out', 'info');
  }, [showToast]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  // ----- notifications -----
  const addNotification = useCallback((message) => {
    setNotifications(n => [{ id: Date.now() + Math.random(), message, time: Date.now() }, ...n].slice(0, 12));
  }, []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  // ----- block update (faithful to updateBlock) -----
  const updateBlock = useCallback((blockId, updates, opts = {}) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const merged = normalizeBlock({ ...prev[idx], ...updates, lastEdited: new Date().toISOString() });
      const base = { ...merged, source: prev[idx].source || SOURCE_DEMO };
      const next = prev.slice();
      next[idx] = base;
      storage.saveBlocksToStorage(next);
      setBlockData(m => { const nm = { ...m }; nm[blockId] = JSON.parse(JSON.stringify(base)); return nm; });
      if (opts.requiresReview) {
        setApprovals(a => {
          const cur = a[blockId];
          if (cur && cur.category === 'approved') {
            const na = { ...a, [blockId]: { ...cur, category: 'requires', reason: cur.reason || 'Block changed by planner', by: 'Demo Planner', time: Date.now() } };
            storage.saveApprovalsToStorage(na);
            return na;
          }
          return a;
        });
      }
      return next;
    });
  }, []);

  const refreshBlock = useCallback((blockId) => {
    // No-op equivalent: React re-renders automatically on state change.
  }, []);

  // ----- block create (faithful to handleAddNewBlock) -----
  const addBlock = useCallback((collection) => {
    const base = { ...normalizeBlock(collection), id: 'NB-' + Math.floor(Math.random() * 900 + 100), source: SOURCE_DEMO };
    if (blocks.some(b => b.id === base.id)) return;
    setBlocks(prev => {
      const next = [...prev, base];
      storage.saveBlocksToStorage(next);
      setBlockData(m => { const nm = { ...m }; nm[base.id] = JSON.parse(JSON.stringify(base)); return nm; });
      return next;
    });
    showToast(`Draft block ${base.id} added`, 'success');
  }, [blocks, showToast]);

  const deleteBlock = useCallback((blockId) => {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== blockId);
      storage.saveBlocksToStorage(next);
      return next;
    });
    setApprovals(a => {
      const na = { ...a };
      delete na[blockId];
      storage.saveApprovalsToStorage(na);
      return na;
    });
    showToast(`Block ${blockId} removed`, 'info');
  }, [showToast]);

  // ----- task priority (kanban drag-to-reprioritize) -----
  const setTaskPriority = useCallback((taskId, priority) => {
    if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority)) return;
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority } : t)));
    setTaskData(td => (td && td[taskId] ? { ...td, [taskId]: { ...td[taskId], priority } } : td));
  }, []);

  // ----- approval -----
  const doRecordApproval = useCallback((blockId, category, reason, isOverride) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const res = recordApproval(approvals, block, category, reason, isOverride, user ? user.name : 'Demo Planner', session);
    setApprovals(res.approvals);
    storage.saveApprovalsToStorage(res.approvals);
    const audit = makeAudit(
      category === 'approved' ? 'approval' : 'rejection',
      `${category === 'approved' ? 'Approved' : 'Rejected'} ${blockId}${reason ? ' — ' + reason : ''}`,
      reason,
      blockId,
      isOverride,
      user ? user.name : 'Demo Planner'
    );
    const nextAudit = pushAudit(auditRecords, audit);
    setAuditRecords(nextAudit);
    storage.saveAuditToStorage(nextAudit);
    showToast(`${blockId} marked ${category.toUpperCase()}`, isOverride ? 'warning' : 'success');
  }, [approvals, auditRecords, blocks, session, user, showToast]);

  const addAudit = useCallback((category, message, reason, blockId, isOverride) => {
    const audit = makeAudit(category, message, reason, blockId, isOverride, user ? user.name : 'Demo Planner');
    setAuditRecords(records => {
      const next = pushAudit(records, audit);
      storage.saveAuditToStorage(next);
      return next;
    });
  }, [user]);

  const clearAudit = useCallback(() => {
    setAuditRecords([]);
    storage.saveAuditToStorage([]);
    showToast('Audit log cleared', 'info');
  }, [showToast]);

  // ----- import -----
  const loadBundleForPreview = useCallback((raw, label) => {
    const bundle = normBundle(raw);
    const validation = diValidate(bundle);
    if (label) {
      setDatasource({ label, importedAt: null });
      storage.saveDataSource(label, null);
    }
    return { bundle, validation, counts: validation.counts };
  }, []);

  const importBundle = useCallback((bundle, label) => {
    const result = applyBundleToState({ units: { approvals } }, bundle);
    if (!result) { showToast('Import failed — invalid dataset', 'error'); return null; }
    setTaskData(result.taskData);
    setBlockData(result.blockData);
    setBlocks(result.blocks);
    setTasks(result.tasks);
    setTrains(result.trainSchedule);
    setCrew(result.crewData);
    setEquipment(result.equipmentData);
    setAssets(result.assets);
    setApprovals(result.approvals);
    storage.saveApprovalsToStorage(result.approvals);
    const labelText = label || 'Imported Dataset';
    setDatasource({ label: labelText, importedAt: new Date().toISOString() });
    storage.saveDataSource(labelText, new Date().toISOString());
    setWhatIf({ original: null, modified: null, lastResult: null, candidates: [], selectedCandidateIdx: 0, validationErrors: '' });
    setAiDemo({ plan: null, changes: null, metrics: null, applied: false, status: '' });
    addAudit('import', 'Dataset imported via Data & Integration', 'VALID', '', false);
    addNotification(`Dataset imported — ${result.counts.tasks} tasks, ${result.counts.assets} assets, ${result.counts.trains} trains, ${result.counts.resources} resources`);
    showToast(`Import complete — ${result.counts.tasks} tasks, ${result.counts.assets} assets, ${result.counts.trains} trains, ${result.counts.resources} resources`, 'success');
    return result.counts;
  }, [addAudit, addNotification, showToast]);

  const resetToDemo = useCallback(() => {
    const fresh = buildDemoState();
    if (!demoRef.current.DEMO_DATA) { showToast('Demo snapshot unavailable', 'error'); return; }
    setTaskData(fresh.taskData);
    setBlockData(() => { const m = {}; fresh.blocks.forEach(b => { m[b.id] = JSON.parse(JSON.stringify(b)); }); return m; });
    setBlocks(fresh.blocks);
    setTasks(fresh.tasks);
    setTrains(fresh.trains);
    setCrew(fresh.crew);
    setEquipment(fresh.equipment);
    setAssets(fresh.assets);
    setApprovals({});
    storage.saveApprovalsToStorage({});
    setDatasource({ label: 'Synthetic Demo Dataset', importedAt: null });
    storage.saveDataSource('Synthetic Demo Dataset', null);
    setWhatIf({ original: null, modified: null, lastResult: null, candidates: [], selectedCandidateIdx: 0, validationErrors: '' });
    setAiDemo({ plan: null, changes: null, metrics: null, applied: false, status: '' });
    storage.saveBlocksToStorage([]);
    setTimeout(() => storage.saveBlocksToStorage(fresh.blocks), 0);
    showToast('Demo data restored', 'success');
  }, [showToast]);

  // ----- what-if -----
  const setWhatIfState = useCallback((patch) => setWhatIf(w => ({ ...w, ...patch })), []);

  const applyOptimizedPlanToPlanner = useCallback((candidate) => {
    const updated = createSimulationCopy(candidate);
    updated.status = 'Requires Review';
    updateBlock(updated.id, updated);
    setWhatIf(w => ({
      ...w,
      original: createSimulationCopy(updated),
      modified: createSimulationCopy(updated),
      candidates: [],
    }));
    showToast(`Optimized plan applied to ${updated.id} - Pending Human Review`, 'success');
  }, [updateBlock, showToast]);

  // ----- Before/After AI demo -----
  const runAiDemo = useCallback((stepsList) => {
    setAiRunState({ active: true, label: 'Running AI Optimization', steps: stepsList });
    const before = aiPlanMetrics(blocks, session);
    const demo2 = aiBuildOptimizedPlan(blocks, session);
    const after = aiPlanMetrics(demo2.working, session);
    setAiDemo(a => ({ ...a, plan: demo2.working, changes: demo2.changes, metrics: { before, after }, applied: false }));
    setAiRunState({ active: false, label: '', steps: [] });
    return { before, after, changes: demo2.changes };
  }, [blocks, session]);

  const resetAiDemo = useCallback(() => {
    setAiDemo({ plan: null, changes: null, metrics: null, applied: false, status: '' });
  }, []);

  const applyAiPlanToPlanner = useCallback(() => {
    if (!aiDemo.changes || !aiDemo.changes.length) { showToast('Nothing to apply', 'error'); return; }
    if (aiDemo.applied) { showToast('Already applied to planner - awaiting approval', 'info'); return; }
    let appliedCount = 0;
    aiDemo.changes.forEach(c => {
      if (!c.moved && !c.resourceOnly) return;
      const upd = createSimulationCopy(c.after);
      upd.lastEdited = new Date().toISOString();
      try { updateBlock(c.id, upd); appliedCount++; } catch (e) { /* per-block guard */ }
    });
    addAudit('optimization', 'AI optimization applied to ' + appliedCount + ' block(s) - pending planner review', 'Draft from BEFORE vs AFTER AI Optimization approved for application by planner', '', false);
    setAiDemo(a => ({ ...a, applied: true, status: `Applied to planner. <b>${appliedCount}</b> block(s) marked <b>Requires Review</b> - awaiting approval in Approval & Audit.` }));
    showToast('AI optimization applied - pending planner review', 'success');
  }, [aiDemo, updateBlock, addAudit, showToast]);

  // ----- tickets (operational wall) -----
  const tickets = TICKETS;

  const value = {
    user, login, logout,
    theme, toggleTheme,
    datasource, setDatasource,
    taskData, blocks, tasks, trains, crew, equipment, assets, blockData,
    approvals, auditRecords, session,
    notifications, addNotification, clearNotifications,
    selectedTasks, setSelectedTasks,
    approvalSelection, setApprovalSelection,
    whatIf, setWhatIfState,
    aiDemo, setAiDemo, runAiDemo, resetAiDemo, applyAiPlanToPlanner,
    aiRunState,
    toasts, showToast, dismissToast,    updateBlock, addBlock, deleteBlock, setTaskPriority,
    doRecordApproval, addAudit, clearAudit,
    loadBundleForPreview, importBundle, resetToDemo,
    applyOptimizedPlanToPlanner,
    tickets,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function taskDataIds(taskMap) {
  return Object.keys(taskMap || {}).slice(0, 6);
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}