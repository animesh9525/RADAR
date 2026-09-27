import React, { useState } from 'react';
import { Settings as SettingsIcon, Palette, Database, ShieldCheck, Info, RotateCcw, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Panel, Badge, ConfirmDialog } from '../components/ui';

export function SettingsPage() {
  const { theme, toggleTheme, datasource, resetToDemo, user, showToast } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [prefs, setPrefs] = useState({
    conflictAlerts: true,
    approvalAlerts: true,
    dailyDigest: false,
    autoAnalyze: true,
  });
  const [weights] = useState([
    { key: 'safety', label: 'Safety Criticality', value: 30 },
    { key: 'asset', label: 'Asset Criticality', value: 25 },
    { key: 'urgency', label: 'Urgency', value: 20 },
    { key: 'delay', label: 'Delay Impact', value: 15 },
    { key: 'operational', label: 'Operational Impact', value: 10 },
  ]);

  const togglePref = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Settings</div>
        <div className="page-description">Appearance, data source, AI weighting and governance preferences.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Appearance" icon={<Palette width={18} height={18} color="var(--purple)" />}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Theme</div>
              <div className="note">Switch between light and dark interface.</div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>{theme === 'dark' ? 'Dark' : 'Light'} mode</button>
          </div>
        </Panel>

        <Panel title="Account" icon={<SettingsIcon width={18} height={18} color="var(--blue)" />}>
          <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="note">Planner</span><b>{user?.name || 'Demo Planner'}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="note">Role</span><b>{user?.role || 'Planner'}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="note">Deployment</span><b>Prototype</b></div>
          </div>
        </Panel>
      </div>

      <Panel title="Data Source" icon={<Database width={18} height={18} color="var(--teal)" />}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{datasource?.label || 'Synthetic Demo Dataset'}</div>
            <div className="note">{datasource?.importedAt ? `Imported ${new Date(datasource.importedAt).toLocaleString()}` : 'Deterministic synthetic demo data — no live TMS feed.'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge tone="info">source: synthetic_demo</Badge>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}><RotateCcw width={13} height={13} /> Reset to Demo</button>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="AI Priority Weighting" icon={<SettingsIcon width={18} height={18} color="var(--orange)" />}>
          <div style={{ display: 'grid', gap: 10 }}>
            {weights.map(w => (
              <div key={w.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span>{w.label}</span><b>{w.value}%</b>
                </div>
                <div style={{ height: 6, background: 'var(--bg)', borderRadius: 4, marginTop: 3, border: '1px solid var(--border)' }}>
                  <div style={{ width: w.value + '%', height: '100%', background: 'var(--blue)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="note" style={{ marginTop: 10 }}>Weights reflect the prototype scoring model and are fixed for demo determinism.</div>
        </Panel>

        <Panel title="Safety Constraints (Hard Rules)" icon={<ShieldCheck width={18} height={18} color="var(--green)" />}>
          <div style={{ display: 'grid', gap: 8 }}>
            {['Minimum buffer between train and maintenance', 'Electrical isolation rules', 'Signalling interlock requirements', 'Crew certification requirements', 'Weather thresholds'].map(r => (
              <div key={r} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <Badge tone="low">ENFORCED</Badge><span style={{ color: 'var(--text2)' }}>{r}</span>
              </div>
            ))}
          </div>
          <div className="note" style={{ marginTop: 10 }}>Safety constraints cannot be overridden by the optimizer.</div>
        </Panel>
      </div>

      <Panel title="Notifications" icon={<Bell width={18} height={18} color="var(--blue)" />}>
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            { k: 'conflictAlerts', label: 'Conflict alerts' },
            { k: 'approvalAlerts', label: 'Approval & override alerts' },
            { k: 'dailyDigest', label: 'Daily planning digest' },
            { k: 'autoAnalyze', label: 'Auto-analyze imported datasets' },
          ].map(p => (
            <label key={p.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, cursor: 'pointer' }}>
              <span>{p.label}</span>
              <input type="checkbox" checked={prefs[p.k]} onChange={() => { togglePref(p.k); showToast(`${p.label} ${prefs[p.k] ? 'disabled' : 'enabled'}`, 'info'); }} />
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="About" icon={<Info width={18} height={18} color="var(--muted)" />}>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
          <b>RADAR</b> — Railway Automated Detection &amp; Analytics Resource (prototype). React + Tailwind (Vite) port of the legacy single-file HTML application. All AI outputs derive from deterministic synthetic demo data and rule-based scoring — no trained ML model is used.
        </div>
      </Panel>

      {confirmReset && (
        <ConfirmDialog
          open
          title="Reset to Demo Data?"
          message="Restore the original <b>Synthetic Demo Dataset</b>? Imported and edited data will be replaced."
          confirmLabel="Reset to Demo Data"
          danger
          onConfirm={() => { resetToDemo(); setConfirmReset(false); }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}