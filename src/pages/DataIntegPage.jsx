import React, { useRef, useState } from 'react';
import { Database, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, PlayCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { demoBundle, previewRows } from '../services/import';
import { DEMO_DATA } from '../data/demoData';
import { Panel, Badge, MetricCard, ConfirmDialog } from '../components/ui';

const TAB_META = {
  tasks: { label: 'Tasks', cols: ['ID', 'Description', 'Priority', 'Department', 'Corridor', 'Duration', 'Due'] },
  assets: { label: 'Assets', cols: ['ID', 'Type', 'Location', 'Condition', 'Criticality', 'Risk'] },
  trains: { label: 'Trains', cols: ['ID', 'Corridor', 'Day', 'Start', 'End', 'Type'] },
  resources: { label: 'Resources', cols: ['Name', 'Department', 'Status', 'Avail.', 'Req.', 'Corridor'] },
  blocks: { label: 'Blocks', cols: ['ID', 'Corridor', 'Day', 'Start', 'End', 'Util.', 'Type'] },
};

export function DataIntegPage() {
  const { loadBundleForPreview, importBundle, resetToDemo, datasource, showToast, addNotification } = useApp();
  const [bundle, setBundle] = useState(null);
  const [validation, setValidation] = useState(null);
  const [tab, setTab] = useState('tasks');
  const [done, setDone] = useState(null);
  const [showIssues, setShowIssues] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const load = (raw, label) => {
    const res = loadBundleForPreview(raw, label);
    setBundle(res.bundle);
    setValidation(res.validation);
    setTab('tasks');
    setDone(null);
    showToast(`Dataset validated — ${res.validation.status}`, 'info');
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const ext = (file.name || '').split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') { showToast('Excel files — save as CSV and upload', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      let raw;
      if (ext === 'json') {
        try { raw = JSON.parse(text); } catch (err) { showToast('Invalid JSON', 'error'); return; }
      } else {
        raw = { tasks: parseCsvRows(text) };
      }
      load(raw, file.name);
    };
    reader.onerror = () => showToast('File read error', 'error');
    reader.readAsText(file);
  };

  const doImport = () => {
    if (!bundle) return;
    setImporting(true);
    setTimeout(() => {
      const counts = importBundle(bundle, datasource?.label === 'Synthetic Demo Dataset' ? 'Imported Dataset' : datasource?.label);
      setImporting(false);
      if (counts) setDone(counts);
    }, 500);
  };

  const rows = bundle ? previewRows(tab, bundle) : [];
  const meta = TAB_META[tab];

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Data &amp; Integration</div>
        <div className="page-description">Load synthetic demo data or import CSV/JSON datasets. Validate, preview, then apply to the live planner.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <MetricCard label="Active Source" value={datasource?.label || 'Synthetic Demo Dataset'} small color="var(--blue)" delta={<span>{datasource?.importedAt ? new Date(datasource.importedAt).toLocaleString() : 'not imported'}</span>} />
        <MetricCard label="Tasks" value={validation?.counts.tasks ?? DEMO_DATA.taskData ? Object.keys(DEMO_DATA.taskData).length : 0} color="var(--purple)" />
        <MetricCard label="Blocks" value={validation?.counts.blocks ?? Object.keys(DEMO_DATA.blockData || {}).length} color="var(--green)" />
        <MetricCard label="Trains" value={validation?.counts.trains ?? DEMO_DATA.trainSchedule.length} color="var(--orange)" />
      </div>

      <Panel title="Dataset Source" icon={<Database width={18} height={18} color="var(--blue)" />} actions={
        <>
          <button className="btn btn-secondary btn-sm" onClick={() => load(demoBundle(DEMO_DATA), 'Synthetic Demo Dataset')}><Sparkles width={13} height={13} /> Load Synthetic Demo</button>
          <button className="btn btn-primary btn-sm" onClick={() => fileRef.current.click()}><Upload width={13} height={13} /> Upload CSV / JSON</button>
          <input ref={fileRef} type="file" accept=".csv,.json,.xlsx,.xls" style={{ display: 'none' }} onChange={onFile} />
        </>
      }>
        <div className="note">CSV must include a header row. JSON may contain keys: tasks, assets, trains, crew, equipment, blocks. Excel files are not parsed — export as CSV first.</div>
      </Panel>

      {validation && (
        <Panel title="Validation" icon={<CheckCircle2 width={18} height={18} color={validation.status === 'VALID' ? 'var(--green)' : 'var(--orange)'} />} actions={
          <>
            {validation.status === 'VALID' ? <Badge tone="low">✓ VALID</Badge> : <Badge tone="medium"><AlertTriangle width={11} height={11} /> NEEDS ATTENTION</Badge>}
            {validation.issues.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowIssues(v => !v)}>Issues ({validation.issues.length})</button>
            )}
            <button className="btn btn-primary btn-sm" disabled={importing} onClick={doImport}><PlayCircle width={13} height={13} /> {importing ? 'Importing…' : 'Import Dataset'}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => load(demoBundle(DEMO_DATA), 'Synthetic Demo Dataset')}>Re-validate</button>
          </>
        }>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))' }}>
            {Object.entries(validation.counts).map(([k, v]) => (
              <div key={k} className="app-card" style={{ padding: 12, textAlign: 'center' }}>
                <div className="card-value" style={{ fontSize: 20 }}>{v}</div>
                <div className="card-label">{k}</div>
              </div>
            ))}
          </div>
          {showIssues && validation.issues.length > 0 && (
            <div style={{ marginTop: 12, maxHeight: 220, overflowY: 'auto', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: 10, fontSize: 12 }}>
              {validation.issues.map((iss, i) => (
                <div key={i} style={{ padding: '3px 0', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
                    [{iss.t.charAt(0).toUpperCase() + iss.t.slice(1)} · {iss.row !== '—' ? 'Row ' + iss.row : '—'}{iss.id ? ' · ' + iss.id : ''}]
                  </span> {iss.msg}
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {bundle && (
        <Panel title="Preview" icon={<FileSpreadsheet width={18} height={18} color="var(--teal)" />} actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(TAB_META).map(t => (
              <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>{TAB_META[t].label}</button>
            ))}
          </div>
        }>
          <div className="note" style={{ marginBottom: 8 }}>Showing {Math.min(rows.length, 10)} of {rows.length} {meta.label.toLowerCase()} records</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-app">
              <thead><tr>{meta.cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j}>{String(c == null ? '' : c).substring(0, 40)}</td>)}</tr>
                ))}
                {rows.length > 10 && <tr><td colSpan={meta.cols.length} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--muted)' }}>… and {rows.length - 10} more rows</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {done && (
        <Panel title="Import Complete" icon={<CheckCircle2 width={18} height={18} color="var(--green)" />}>
          <div className="alert alert-green"><span className="alert-icon">✓</span><div>Dataset imported — {done.tasks} tasks, {done.assets} assets, {done.trains} trains, {done.resources} resources, {done.blocks} blocks.</div></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => addNotification('AI analysis complete — imported dataset ready for planning')}><Sparkles width={13} height={13} /> Analyze with AI-ABPS</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmReset(true)}><RotateCcw width={13} height={13} /> Reset to Demo Data</button>
          </div>
        </Panel>
      )}

      <Panel title="Reset" icon={<RotateCcw width={18} height={18} color="var(--red)" />}>
        <div className="note" style={{ marginBottom: 10 }}>Restore the original Synthetic Demo Dataset. Imported/edited block, task, train and resource data will be replaced; approvals and audit history for the current dataset are cleared.</div>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>Reset to Demo Data</button>
      </Panel>

      {confirmReset && (
        <ConfirmDialog
          open
          title="Reset to Demo Data?"
          message="Restore the original <b>Synthetic Demo Dataset</b>? All imported/edited block, task, train and resource data will be replaced. Approvals and audit history for the current dataset will be cleared."
          confirmLabel="Reset to Demo Data"
          danger
          onConfirm={() => { resetToDemo(); setConfirmReset(false); setBundle(null); setValidation(null); setDone(null); }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}

function parseCsvRows(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line) => {
    const out = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) { if (c === '"') { if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
      else if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  const headers = parseRow(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = parseRow(line); const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  });
}