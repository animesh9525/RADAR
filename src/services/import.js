import { normalizeBlock } from './blocks';

export const KNOWN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const KNOWN_CORRIDORS = ['C1', 'C2', 'C3', 'C4'];

function trim(s) { return String(s == null ? '' : s).trim(); }
function isNum(v) { return !isNaN(parseInt(v, 10)); }
function isDayName(v) { return KNOWN_DAYS.indexOf(v) !== -1; }
function deepClone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }
function timeToMin(s) { const m = String(s).match(/^(\d{1,2}):(\d{2})$/); if (!m) return NaN; return parseInt(m[1], 10) * 60 + parseInt(m[2], 10); }
function fmtTime(m) { const h = Math.floor(m / 60), mn = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mn < 10 ? '0' : '') + mn; }

function parseCSVRow(line) {
  const out = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

export function parseCSV(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = parseCSVRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  });
}

export function demoBundle(demoData) {
  return {
    tasks: demoData.DEMO_SNAPSHOT.tasks,
    trains: demoData.DEMO_SNAPSHOT.trains,
    crew: demoData.DEMO_SNAPSHOT.crew,
    equipment: demoData.DEMO_SNAPSHOT.equipment,
    blocks: demoData.DEMO_SNAPSHOT.blocks,
    assets: demoData.DEMO_SNAPSHOT.demoAssets || demoData.demoAssets || []
  };
}

export function normBundle(raw) {
  const out = { tasks: {}, assets: [], trains: [], crew: [], equipment: [], blocks: {} };
  let taskArr = [];
  const tRaw = raw.tasks || raw.taskData || raw.taskDataMap || null;
  if (Array.isArray(tRaw)) taskArr = tRaw;
  else if (tRaw && typeof tRaw === 'object') {
    Object.keys(tRaw).forEach(k => { const t = deepClone(tRaw[k]); t.id = k; taskArr.push(t); });
  }
  let seq = 0;
  taskArr.forEach(t => {
    let id = trim(t.id || t.taskId || 'T' + (++seq));
    if (!id) id = 'T' + (++seq);
    const dept = trim(t.department || t.dept || 'Engineering');
    const priority = trim(t.priority || t.criticality || 'MEDIUM').toUpperCase();
    let duration = trim(t.duration);
    if (/^\d+$/.test(duration)) duration = duration + ' min';
    let due = trim(t.due || t.dueDate || t.date);
    if (!due) due = 'Next week';
    const risk = parseInt(t.risk, 10); const riskVal = isNaN(risk) ? 30 : risk;
    let title = trim(t.title || t.description || id + ' task');
    if (String(title).indexOf(id + ' ·') === -1 && String(title).indexOf(id + '-') === -1) title = id + ' · ' + title;
    out.tasks[id] = {
      id, title, description: trim(t.description || title),
      priority, department: dept,
      corridor: trim(t.corridor || 'C1'),
      duration, due: due, risk: riskVal,
      block: trim(t.block), asset: trim(t.asset),
      requiredCrew: parseInt(t.requiredCrew, 10) || 0,
      requiredEquip: parseInt(t.requiredEquip, 10) || 0,
      reason: trim(t.reason)
    };
  });
  const aRaw = raw.assets || raw.assetData || [];
  if (Array.isArray(aRaw)) aRaw.forEach((a, i) => {
    const id = trim(a.id || a.assetId || 'ASSET-' + (i + 1));
    out.assets.push({
      id,
      type: trim(a.type || a.assetType || 'Unknown'),
      location: trim(a.location),
      condition: trim(a.condition || 'Good'),
      criticality: trim(a.criticality || 'Medium'),
      lastMaintenance: trim(a.lastMaintenance || 'N/A'),
      riskScore: parseInt(a.riskScore || a.risk, 10) || 40
    });
  });
  const trRaw = raw.trains || raw.trainSchedule || [];
  if (Array.isArray(trRaw)) trRaw.forEach((t, i) => {
    const id = trim(t.id || t.trainId || 'T' + (i + 1));
    let date = trim(t.date || t.day);
    if (!isDayName(date)) date = 'Monday';
    const start = trim(t.start || t.startTime || '00:00');
    const end = trim(t.end || t.endTime || '23:59');
    const type = trim(t.type || t.trainType || 'Express');
    out.trains.push({ id, name: trim(t.name || id), corridor: trim(t.corridor || 'C1'), date, start, end, type });
  });
  const cRaw = raw.crew || raw.crewData || [];
  if (Array.isArray(cRaw)) cRaw.forEach(c => {
    let status = trim(c.status || 'available').toUpperCase();
    if (['AVAILABLE', 'LIMITED', 'UNAVAILABLE'].indexOf(status) === -1) status = 'AVAILABLE';
    out.crew.push({
      name: trim(c.name || c.id || 'Crew'),
      department: trim(c.department || c.dept || 'Engineering'),
      status,
      available: parseInt(c.available, 10) || 0,
      required: parseInt(c.required, 10) || 1,
      corridor: trim(c.corridor || ''),
      currentBlock: trim(c.currentBlock || c.current),
      subStatus: trim(c.subStatus || ''),
      skills: Array.isArray(c.skills) ? c.skills : (c.skills ? String(c.skills).split(',').map(s => trim(s)) : [])
    });
  });
  const eRaw = raw.equipment || raw.equipmentData || [];
  if (Array.isArray(eRaw)) eRaw.forEach(e => {
    let status = trim(e.status || 'AVAILABLE').toUpperCase();
    if (['AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'RESERVED'].indexOf(status) === -1) status = 'AVAILABLE';
    out.equipment.push({
      name: trim(e.name || e.id || 'Equipment'),
      department: trim(e.department || e.dept || 'Engineering'),
      corridor: trim(e.corridor || ''),
      available: parseInt(e.available, 10) || 0,
      required: parseInt(e.required, 10) || 1,
      status,
      assignedBlock: trim(e.assignedBlock || e.assigned || '')
    });
  });
  let bRaw = raw.blocks || raw.blockData || raw.blockDataMap || {};
  let bArr = Array.isArray(bRaw) ? bRaw : Object.keys(bRaw).map(k => { const v = deepClone(bRaw[k]); v.id = k; return v; });
  bArr.forEach((b, i) => {
    const id = trim(b.id || b.blockId || 'B-' + (100 + i));
    let startTime = trim(b.startTime || b.start);
    let endTime = trim(b.endTime || b.end);
    if ((!isNum(timeToMin(startTime)) || !isNum(timeToMin(endTime))) && trim(b.window || '')) {
      const wm = trim(b.window).match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/);
      if (wm) {
        if (!isNum(timeToMin(startTime))) startTime = wm[1];
        if (!isNum(timeToMin(endTime))) endTime = wm[2];
      }
    }
    if (!isNum(timeToMin(startTime))) startTime = '06:00';
    if (!isNum(timeToMin(endTime))) endTime = fmtTime((timeToMin(startTime) + 120) % 1440);
    if (isNum(timeToMin(endTime)) && isNum(timeToMin(startTime)) && timeToMin(endTime) <= timeToMin(startTime))
      endTime = fmtTime((timeToMin(startTime) + 120) % 1440);
    const corridor = trim(b.corridor || 'C1');
    let date = trim(b.date || b.day);
    if (!isDayName(date)) date = 'Monday';
    let startMin = timeToMin(startTime), endMin = timeToMin(endTime);
    if (endMin <= startMin) endMin = startMin + 120;
    const windowMins = endMin - startMin;
    const durationH = +(windowMins / 60).toFixed(1);
    let utilization = parseInt(b.utilization, 10);
    if (isNaN(utilization) || utilization < 0) utilization = 75;
    if (utilization > 100) utilization = 100;
    let from = trim(b.from || b.fromStation);
    if (!from) from = 'Station ' + corridor + '-A';
    let to = trim(b.to || b.toStation);
    if (!to) to = 'Station ' + corridor + '-C';
    out.blocks[id] = {
      id, corridor, date,
      startTime, endTime,
      window: windowMins + ' min',
      duration: durationH + 'h',
      utilization,
      type: trim(b.type || b.workType || 'Maintenance'),
      reason: trim(b.reason || b.description || ''),
      priority: trim(b.priority || ''),
      requiredCrew: parseInt(b.requiredCrew, 10) || 3,
      availableCrew: parseInt(b.availableCrew, 10) || 3,
      requiredEquip: parseInt(b.requiredEquip, 10) || 1,
      equipmentStatus: trim(b.equipmentStatus || ''),
      track: trim(b.track || ''),
      from, to,
      maintenanceType: trim(b.maintenanceType || b.type || ''),
      tasks: Array.isArray(b.tasks) ? b.tasks : [],
      status: trim(b.status || '')
    };
  });
  return out;
}

export function diValidate(b) {
  const counts = { tasks: 0, assets: 0, trains: 0, resources: 0, blocks: 0 };
  const issues = [];
  Object.keys(b.tasks || {}).forEach(id => {
    const t = b.tasks[id]; counts.tasks++;
    if (!trim(t.title)) issues.push({ t: 'tasks', row: '—', id, msg: 'Missing Task Description' });
    if (!trim(t.department)) issues.push({ t: 'tasks', row: '—', id, msg: 'Missing Department' });
    if (!trim(t.duration)) issues.push({ t: 'tasks', row: '—', id, msg: 'Missing Task Duration' });
    if (!/^(CRITICAL|HIGH|MEDIUM|LOW)$/i.test(t.priority)) issues.push({ t: 'tasks', row: '—', id, msg: 'Invalid Priority "' + t.priority + '"' });
  });
  (b.assets || []).forEach((a, i) => {
    counts.assets++;
    const row = i + 2;
    if (!trim(a.id)) issues.push({ t: 'assets', row, id: '', msg: 'Missing Asset ID' });
    if (!trim(a.type)) issues.push({ t: 'assets', row, id: a.id, msg: 'Missing Asset Type' });
    if (!trim(a.location)) issues.push({ t: 'assets', row, id: a.id, msg: 'Missing Location' });
  });
  (b.trains || []).forEach((t, i) => {
    counts.trains++;
    const row = i + 2;
    if (!trim(t.id)) issues.push({ t: 'trains', row, id: '', msg: 'Missing Train ID' });
    if (!trim(t.corridor)) issues.push({ t: 'trains', row, id: t.id, msg: 'Missing Corridor' });
    if (!isDayName(t.date)) issues.push({ t: 'trains', row, id: t.id, msg: 'Invalid Day "' + t.date + '"' });
    if (isNaN(timeToMin(t.start))) issues.push({ t: 'trains', row, id: t.id, msg: 'Invalid Start Time "' + t.start + '"' });
    if (isNaN(timeToMin(t.end))) issues.push({ t: 'trains', row, id: t.id, msg: 'Invalid End Time "' + t.end + '"' });
  });
  (b.crew || []).forEach((c, i) => {
    counts.resources++;
    const row = i + 2;
    if (!trim(c.name)) issues.push({ t: 'resources', row, id: '', msg: 'Missing Crew Name' });
    if (!trim(c.department)) issues.push({ t: 'resources', row, id: c.name, msg: 'Missing Department' });
    if (isNaN(parseInt(c.available, 10))) issues.push({ t: 'resources', row, id: c.name, msg: 'Missing Available Count' });
  });
  (b.equipment || []).forEach((e, i) => {
    counts.resources++;
    const row = i + 2;
    if (!trim(e.name)) issues.push({ t: 'resources', row, id: '', msg: 'Missing Equipment Name' });
    if (!/^(AVAILABLE|LIMITED|UNAVAILABLE|RESERVED)$/i.test(e.status)) issues.push({ t: 'resources', row, id: e.name, msg: 'Invalid Status "' + e.status + '"' });
  });
  Object.keys(b.blocks || {}).forEach(id => {
    const bl = b.blocks[id]; counts.blocks++;
    if (!trim(bl.corridor)) issues.push({ t: 'blocks', row: '—', id, msg: 'Missing Corridor' });
    if (isNaN(timeToMin(bl.startTime))) issues.push({ t: 'blocks', row: '—', id, msg: 'Invalid Start Time' });
    if (isNaN(timeToMin(bl.endTime))) issues.push({ t: 'blocks', row: '—', id, msg: 'Invalid End Time' });
  });
  return { counts, issues, status: issues.length ? 'NEEDS ATTENTION' : 'VALID' };
}

export function previewRows(tab, bundle) {
  if (!bundle) return [];
  if (tab === 'tasks') return Object.keys(bundle.tasks).map(id => { const t = bundle.tasks[id]; return [id, t.title.split(' · ')[1] || t.title, t.priority, t.department, t.corridor, t.duration, t.due]; });
  if (tab === 'assets') return (bundle.assets || []).map(a => [a.id, a.type, a.location, a.condition, a.criticality, a.riskScore]);
  if (tab === 'trains') return (bundle.trains || []).map(t => [t.id, t.corridor, t.date, t.start, t.end, t.type]);
  if (tab === 'resources') {
    const rows = [];
    (bundle.crew || []).forEach(c => rows.push([c.name, c.department, c.status, c.available, c.required, c.corridor || '']));
    (bundle.equipment || []).forEach(e => rows.push([e.name, e.department, e.status, e.available, e.required, e.corridor || '']));
    return rows;
  }
  if (tab === 'blocks') return Object.keys(bundle.blocks).map(id => { const bl = bundle.blocks[id]; return [id, bl.corridor, bl.date, bl.startTime, bl.endTime, bl.utilization + '%', bl.type]; });
  return [];
}

// Pure port of applyBundle() — returns the next dataset slice for the context.
export function applyBundleToState(session, bundle) {
  if (!bundle) return null;
  const b = bundle;
  const taskData = {};
  Object.keys(b.tasks).forEach(k => { taskData[k] = b.tasks[k]; });
  const blockData = {};
  Object.keys(b.blocks).forEach(k => { blockData[k] = b.blocks[k]; });
  const trainSchedule = (b.trains || []).map(t => deepClone(t));
  const crewData = (b.crew || []).map(c => deepClone(c));
  const equipmentData = (b.equipment || []).map(e => deepClone(e));
  const tasks = Object.keys(taskData).map(k => deepClone(taskData[k]));
  const blocks = Object.keys(blockData).map(k => normalizeBlock(Object.assign(deepClone(blockData[k]), { id: k })));
  const assets = (b.assets || []).map(a => deepClone(a));
  const liveBlockIds = blocks.map(bl => bl.id);
  const approvals = {};
  Object.keys(session.approvals || {}).forEach(id => {
    if (liveBlockIds.indexOf(id) !== -1) approvals[id] = session.approvals[id];
  });
  return { taskData, blockData, trainSchedule, crewData, equipmentData, tasks, blocks, assets, approvals, counts: { tasks: tasks.length, assets: assets.length, trains: trainSchedule.length, resources: crewData.length + equipmentData.length, equipment: equipmentData.length, blocks: blocks.length } };
}