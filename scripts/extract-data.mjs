// Reads ai-abps.html and writes:
// 1) src/legacy/original-script.js   — the full inline <script> (verbatim reference)
// 2) src/data/demoData.js            — deterministic demo data extracted from the
//    original JS (state-relevant data region evaluated in a jsdom-free vm).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(fileURLToPath(import.meta.url));
const project = join(root, '..');
const html = readFileSync(join(project, '..', 'ai-abps.html'), 'utf8');

// Extract inline scripts (the main one only — the one containing "const state = {")
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1].trim()).filter(s => s.length > 1000);
const main = scripts.sort((a, b) => b.length - a.length)[0];
if (!main || main.indexOf('const state = {') === -1) throw new Error('main script not found');

mkdirSync(join(project, 'src', 'legacy'), { recursive: true });
mkdirSync(join(project, 'src', 'data'), { recursive: true });
writeFileSync(join(project, 'src', 'legacy', 'original-script.js'), main, 'utf8');
console.log('WROTE legacy/original-script.js bytes=' + main.length);

const lines = main.split('\n');

// Find data region: from "const state = {" to just after "const STORAGE_VERSION"
function lineIndexOf(text) {
  const idx = lines.findIndex(l => l.indexOf(text) !== -1);
  if (idx < 0) throw new Error('missing ' + text);
  return idx;
}
const startIdx = lineIndexOf('const state = {');
const demoSnapIdx = lineIndexOf('const DEMO_SNAPSHOT =');
// End after the data section: next "====" banner after DEMO_SNAPSHOT plus everything
// up to and including STORAGE_VERSION.
const dataEnd = lineIndexOf('const STORAGE_VERSION');
const dataRegion = lines.slice(startIdx, dataEnd + 2).join('\n');

const ctx = { console, setTimeout, clearTimeout, JSON };
vm.createContext(ctx);
vm.runInContext(dataRegion + '\nthis.__out = { state, taskData, blockData, crewData, equipmentData, conflicts, presentationSlides, trainSchedule, DEMO_SNAPSHOT, KNOWN_CORRIDORS, KNOWN_DAYS, KNOWN_DEPARTMENTS };', ctx);

// demoAssets() equivalent: build the assets deterministically.
const { KNOWN_CORRIDORS: KC, DEMO_SNAPSHOT } = ctx.__out;
function demoAssets() {
  const assets = []; let idx = 1;
  const corrAssets = [
    { type: 'Track Section', dept: 'Engineering', cond: 'Good', crit: 'High', risk: 72 },
    { type: 'Points & Crossings', dept: 'Engineering', cond: 'Fair', crit: 'Medium', risk: 55 },
    { type: 'Signal System', dept: 'S&T', cond: 'Good', crit: 'Critical', risk: 68 },
    { type: 'OHE Equipment', dept: 'Traction', cond: 'Fair', crit: 'Medium', risk: 50 }
  ];
  KC.forEach(corridor => {
    const fromStation = 'S' + corridor.slice(1) + '-A';
    const toStation = 'S' + corridor.slice(1) + '-C';
    corrAssets.forEach(ca => {
      assets.push({
        id: 'A-' + (idx < 10 ? '0' : '') + idx,
        type: ca.type,
        deptName: ca.dept,
        location: corridor + ' (' + fromStation + ' → ' + toStation + ')',
        condition: ca.cond,
        criticality: ca.crit,
        lastMaintenance: '45 days ago',
        riskScore: ca.risk,
        corridor
      });
      idx++;
    });
  });
  return assets;
}

// networkDemo: extract verbatim from the original script text.
const ndStart = lineIndexOf('var networkDemo = {');
// scan to matching close brace at column 0 (the object literal is indented 0)
let depth = 0, ndEnd = ndStart, started = false;
for (let i = ndStart; i < lines.length; i++) {
  const trimmed = lines[i];
  for (const ch of trimmed) {
    if (ch === '{') { depth++; started = true; }
    else if (ch === '}') { depth--; if (started && depth === 0) { ndEnd = i; break; } }
  }
  if (depth === 0 && started) break;
}
const networkDemoRegion = lines.slice(ndStart, ndEnd + 1).join('\n');
const ctx2 = {};
vm.createContext(ctx2);
try {
  vm.runInContext(networkDemoRegion + '\nthis.__out = networkDemo;', ctx2);
} catch (e) {
  console.log('NETWORKDEMO_EVAL_FAIL ' + e.message);
}
const networkDemo = ctx2.__out || null;
// attach derived coordinates (as the original does)
if (networkDemo) {
  networkDemo.coordinates = {};
  const sl = {};
  networkDemo.stations.forEach(s => { sl[s.id] = [s.lat, s.lng]; });
  networkDemo.corridors.forEach(c => {
    if (!c.coordinates || !c.coordinates.length) c.coordinates = c.stations.map(id => sl[id]);
  });
  networkDemo.blocks.forEach(b => { b.coordinates = [sl[b.from], sl[b.to]]; });
}

const out = {
  meta: {
    source: 'synthetic_demo',
    label: 'Synthetic Demo Dataset',
    disclaimer: 'Synthetic demo data — not live Indian Railways operational data.',
    generatedFrom: 'ai-abps.html (reference implementation)'
  },
  DEMO_SNAPSHOT,
  taskData: ctx.__out.taskData,
  blockData: ctx.__out.blockData,
  crewData: ctx.__out.crewData,
  equipmentData: ctx.__out.equipmentData,
  conflictsByDefault: ctx.__out.conflicts,
  presentationSlides: ctx.__out.presentationSlides,
  trainSchedule: ctx.__out.trainSchedule,
  demoAssets: demoAssets(),
  networkDemo
};

writeFileSync(
  join(project, 'src', 'data', 'demoData.js'),
  '// Auto-extracted from ai-abps.html (reference implementation). DO NOT hand-edit; rerun scripts/extract-data.mjs.\nexport const DEMO_DATA = ' + JSON.stringify(out, null, 2) + ';\n',
  'utf8'
);
console.log('WROTE data/demoData.js tasks=' + Object.keys(out.taskData).length + ' blocks=' + Object.keys(out.blockData).length + ' assets=' + out.demoAssets.length + ' networkStations=' + (out.networkDemo ? out.networkDemo.stations.length : 0));