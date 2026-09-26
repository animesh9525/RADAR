import React from 'react';
import { ChevronsDownUp } from 'lucide-react';

const COLOR_BY_CORRIDOR = {
  C1: '#38bdf8',
  C2: '#34d399',
  C3: '#fbbf24',
  C4: '#a78bfa',
};

export function NetworkSidebar({ blocks, analyzeConflicts, onToggle, onSelectBlock, selectedId }) {
  return (
    <aside className="no-side no-glass" id="noSide">
      <div className="no-side-hd">
        <span className="no-side-title">ACTIVE &amp; PLANNED BLOCKS</span>
        <button className="no-btn no-side-min" onClick={onToggle} aria-label="Toggle sidebar">
          <ChevronsDownUp width={13} height={13} />
        </button>
      </div>
      <div className="no-side-list" id="noBlocksPanel">
        {blocks.map(b => {
          if (!b || !b.id) return null;
          const cf = analyzeConflicts ? analyzeConflicts(b) : { hasConflict: false, hasCritical: false };
          const cls = cf.hasCritical ? 'crit' : (cf.hasConflict ? 'warn' : 'ok');
          const lbl = cf.hasCritical ? 'CRITICAL' : (cf.hasConflict ? 'WARNING' : 'CLEAR');
          const col = COLOR_BY_CORRIDOR[b.corridor] || '#94a3b8';
          return (
            <div
              key={b.id}
              className={`no-bitem${selectedId === b.id ? ' sel' : ''}`}
              data-no={`block:${b.id}`}
              onClick={() => onSelectBlock && onSelectBlock(b.id)}
            >
              <span className="no-bdot" style={{ background: col }} />
              <div style={{ minWidth: 0 }}>
                <div className="no-bid">{b.id}</div>
                <div className="no-bmeta">
                  {b.corridor || ''} · {b.startTime || ''}–{b.endTime || ''} · {b.type || ''}
                </div>
              </div>
              <span className={`no-bbadge ${cls}`}>{lbl}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
