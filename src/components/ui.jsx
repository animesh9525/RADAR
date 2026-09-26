import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export function Badge({ tone = 'info', children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    Clear: 'low',
    Warning: 'medium',
    Conflict: 'critical',
    'Requires Review': 'plain',
    Critical: 'critical',
    High: 'high',
    Medium: 'medium',
  };
  return <Badge tone={map[status] || 'info'}>{status}</Badge>;
}

export function Panel({ title, icon, actions, children, bodyClass = '', className = '' }) {
  return (
    <div className={`app-panel ${className}`}>
      {(title || actions) && (
        <div className="panel-header">
          <div className="panel-title">
            {icon}
            {title}
          </div>
          {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
        </div>
      )}
      <div className={`panel-body ${bodyClass}`}>{children}</div>
    </div>
  );
}

export function MetricCard({ label, value, delta, color, small, icon: Icon }) {
  return (
    <div className="app-card metric-card" style={{ ['--metric-accent']: color || 'var(--blue)' }}>
      <div className="metric-card-head">
        <div className="card-label">{label}</div>
        {Icon && <span className="metric-ic"><Icon width={16} height={16} /></span>}
      </div>
      <div className="card-value" style={small ? { fontSize: 20 } : color ? { color } : undefined}>{value}</div>
      <div className="card-delta">{delta != null ? delta : <span style={{ visibility: 'hidden' }}>·</span>}</div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 120,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '44px 16px', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--glass-strong)',
          WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(1.15)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(1.15)',
          borderRadius: 'var(--radius-card)', border: '1px solid var(--border-2)',
          boxShadow: 'var(--shadow-xl)', width, maxWidth: '100%', overflow: 'hidden',
          animation: 'popIn 0.18s var(--ease)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <h4>{title}</h4>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X width={16} height={16} /></button>
        </div>
        <div style={{ padding: 18, maxHeight: '72vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} width={440}>
      <div dangerouslySetInnerHTML={{ __html: message || '' }} style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon, title = 'No data', desc }) {
  const isStr = typeof icon === 'string';
  const isEl = React.isValidElement(icon);
  const node = !isStr && icon && !isEl
    ? React.createElement(icon, { width: 22, height: 22, strokeWidth: 1.75 })
    : icon;
  return (
    <div style={{ textAlign: 'center', padding: '34px 18px', color: 'var(--muted)' }}>
      <div style={{
        margin: '0 auto 12px', width: 46, height: 46, borderRadius: 12,
        background: 'var(--card-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)',
      }}>
        {isStr
          ? <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{icon || '·'}</span>
          : node ? <span style={{ display: 'inline-flex', opacity: 0.85 }}>{node}</span> : null}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{title}</div>
      {desc && <div style={{ fontSize: 13, marginTop: 5, maxWidth: 360, margin: '5px auto 0' }}>{desc}</div>}
    </div>
  );
}

export function ProgressBar({ value, color }) {
  return (
    <div className="pbar" style={{ ['--pbar-color']: color || 'var(--blue)' }}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ToastHost({ toasts, onDismiss }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => {
        const tone = t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : t.type === 'warning' ? 'var(--orange)' : 'var(--blue)';
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? X : t.type === 'warning' ? AlertTriangle : Info;
        return (
          <div key={t.id} onClick={() => onDismiss(t.id)}
            style={{
              background: 'var(--card)', border: `1px solid ${tone}`, borderLeft: `4px solid ${tone}`,
              borderRadius: 10, padding: '10px 14px', fontWeight: 600, fontSize: 13,
              boxShadow: 'var(--shadow-lg)', cursor: 'pointer', maxWidth: 320, color: 'var(--text)',
              display: 'flex', gap: 8, alignItems: 'center',
              animation: 'toastIn 0.18s var(--ease)',
            }}>
            <Icon width={16} height={16} style={{ color: tone, flexShrink: 0 }} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AIProcessOverlay2({ runState }) {
  if (!runState || !runState.active) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 210,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)', padding: 26, width: 340, textAlign: 'center',
      }}>
        <Loader2 className="animate-spin" width={26} height={26} style={{ color: 'var(--purple)', margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 800, fontSize: 15 }}>{runState.label}</div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', textAlign: 'left' }}>
          {runState.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '2px 0' }}>
              <CheckCircle2 width={13} height={13} style={{ color: 'var(--green)', flexShrink: 0 }} /><span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}