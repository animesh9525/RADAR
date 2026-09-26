import React from 'react';
import { X, FolderOpen, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NetworkDetailsDrawer({ detail, onClose, analyzeConflicts }) {
  const navigate = useNavigate();

  if (!detail) return null;

  const renderBlock = (block) => {
    const cf = analyzeConflicts ? analyzeConflicts(block) : { level: 'clear', severity: 'No Conflict', all: [], hasConflict: false };
    const depts = [...new Set((block.tasks || []).map(t => t.department))];
    const sui = detail.sui;
    const rec = detail.rec;
    const suiLv = sui ? (sui.score >= 85 ? 'ok' : sui.score >= 60 ? 'warn' : 'crit') : '';

    return (
      <>
        <button className="no-det-close" onClick={onClose} aria-label="Close">
          <X width={13} height={13} />
        </button>
        <div className="no-det-title">
          {block.id}
          <span className={`no-det-lv ${cf.level || 'clear'}`}>{cf.severity || 'No Conflict'}</span>
        </div>
        <div className="no-det-kv">
          <div><b>Corridor</b><span>{block.corridor || ''} <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: detail.color, verticalAlign: 'middle', marginLeft: 4 }} /></span></div>
          <div><b>Location</b><span>{block.from || ''} → {block.to || ''}</span></div>
          <div><b>Track</b><span>{block.track || 'UP'}</span></div>
          <div><b>When</b><span>{block.date || ''} · {block.startTime || ''}–{block.endTime || ''}</span></div>
          <div><b>Duration</b><span>{block.duration || '120 min'}</span></div>
          <div><b>Utilization</b><span>{block.utilization || '75%'}</span></div>
          <div><b>Type</b><span>{block.type || 'SINGLE'}</span></div>
          <div><b>Priority</b><span>{block.priority || 'MEDIUM'}</span></div>
          <div><b>Crew</b><span>{block.requiredCrew != null ? block.requiredCrew : ''}/{block.availableCrew != null ? block.availableCrew : ''}</span></div>
          <div><b>Equipment</b><span>{block.requiredEquip || 'General'} ({block.equipmentStatus || 'AVAILABLE'})</span></div>
          <div><b>Status</b><span>{block.status || 'Clear'}</span></div>
        </div>
        {sui && (
          <>
            <div className="no-sec">AI SUITABILITY</div>
            <div className="no-suit">
              <div className="no-suit-row">
                <b>Own-Activity Suitability</b>
                <span className={`no-det-lv ${suiLv}`}>{sui.score}/100</span>
              </div>
              <div className="no-sbar">
                <i style={{ width: `${Math.max(4, Math.min(100, sui.score))}%` }} />
              </div>
            </div>
            {rec && (
              <>
                <div className="no-sec">AI RECOMMENDATION</div>
                <div className="no-rec">
                  <b>{rec.title}</b>
                  <span>{rec.reason}</span>
                </div>
              </>
            )}
          </>
        )}
        {cf.all && cf.all.length > 0 && (
          <>
            <div className="no-sec">CONFLICTS ({cf.all.length})</div>
            <div className="no-conf-list">
              {cf.all.map((cr, i) => {
                const label = cr.type === 'train' ? `TRAIN ${cr.trainId || ''}` : String(cr.type || '').toUpperCase();
                return (
                  <div key={i} className="no-conf-row">
                    <b>{label}</b> · {cr.message}
                  </div>
                );
              })}
            </div>
          </>
        )}
        {block.tasks && block.tasks.length > 0 && (
          <>
            <div className="no-sec">TASKS ({block.tasks.length})</div>
            <div className="no-det-tasks">
              {block.tasks.map((t, i) => (
                <div key={i} className="no-task">
                  <span>{t.id} · {t.name}</span>
                  <span>{t.department} · {t.duration}</span>
                </div>
              ))}
            </div>
            <div className="no-sec" style={{ marginTop: 10 }}>DEPARTMENTS</div>
            <div className="no-det-tasks">
              <div className="no-task">
                <span>{depts.join(', ')}</span>
              </div>
            </div>
          </>
        )}
        <div className="no-det-actions">
          <button className="no-det-btn" onClick={() => navigate('/block-planner', { state: { openBlock: block.id } })}>
            <FolderOpen width={13} height={13} /> View Block Details
          </button>
          <button className="no-det-btn whatif" onClick={() => navigate('/what-if', { state: { selectedBlock: block.id } })}>
            <GitBranch width={13} height={13} /> Open What-If
          </button>
        </div>
      </>
    );
  };

  const renderStation = (station, trains) => {
    return (
      <>
        <button className="no-det-close" onClick={onClose} aria-label="Close">
          <X width={13} height={13} />
        </button>
        <div className="no-det-title">
          Station {station.id}
          <span className="no-det-lv clear">{station.corridors.join(' ')}</span>
        </div>
        <div className="no-det-kv">
          <div><b>Corridors</b><span>{station.corridors.join(' · ')} <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: detail.color, verticalAlign: 'middle', marginLeft: 4 }} /></span></div>
          <div><b>Interchange</b><span>{station.corridors.length > 1 ? 'Yes' : 'No'}</span></div>
          <div><b>Depot</b><span>{station.depot ? 'Yes' : 'No'}</span></div>
          <div><b>Serving Trains</b><span>{trains.length}</span></div>
        </div>
        {trains.length > 0 && (
          <>
            <div className="no-sec">TRAINS NEARBY ({trains.length})</div>
            {trains.map((t, i) => (
              <div key={i} className="no-task">
                <span>{t.id}</span>
                <span>{t.type || 'Passenger'} · {t.corridor} · {t.start || ''}–{t.end || ''}</span>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  const renderCorridor = (corridor, blocks) => {
    const conflicted = blocks.filter(b => {
      const cf = analyzeConflicts ? analyzeConflicts(b) : { hasConflict: false };
      return cf.hasConflict;
    });
    const cfCount = conflicted.length;
    const lv = cfCount > 1 ? 'crit' : (cfCount === 1 ? 'warn' : 'clear');
    const lbl = cfCount > 1 ? 'CRITICAL' : (cfCount === 1 ? 'WARNING' : 'CLEAR');

    return (
      <>
        <button className="no-det-close" onClick={onClose} aria-label="Close">
          <X width={13} height={13} />
        </button>
        <div className="no-det-title">
          Corridor {corridor.id}
          <span className={`no-det-lv ${lv}`}>{lbl}</span>
        </div>
        <div className="no-det-kv">
          <div><b>Route</b><span>{corridor.chain.join(' → ')}</span></div>
          <div><b>Blocks</b><span>{blocks.length}</span></div>
          <div><b>Conflicts</b><span>{cfCount}</span></div>
          <div><b>Status</b><span>{lbl}</span></div>
        </div>
        {conflicted.length > 0 && (
          <>
            <div className="no-sec">CONFLICTED BLOCKS</div>
            {conflicted.map((b, i) => (
              <div key={i} className="no-trow" data-no={`block:${b.id}`} onClick={() => detail.onSelectBlock && detail.onSelectBlock(b.id)}>
                <span>{b.id}</span>
                <span>CONFLICT</span>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  const renderTrain = (train) => {
    return (
      <>
        <button className="no-det-close" onClick={onClose} aria-label="Close">
          <X width={13} height={13} />
        </button>
        <div className="no-det-title">
          Train {train.id}
          <span className="no-det-lv clear">{String(train.type || 'Train').toUpperCase()}</span>
        </div>
        <div className="no-det-kv">
          <div><b>Type</b><span>{train.type || 'Passenger'}</span></div>
          <div><b>Corridor</b><span>{train.corridor || ''} <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: detail.color, verticalAlign: 'middle', marginLeft: 4 }} /></span></div>
          <div><b>Date</b><span>{train.date || 'Monday'}</span></div>
          <div><b>Window</b><span>{train.start || ''}–{train.end || ''}</span></div>
        </div>
        <div className="no-sec" style={{ marginTop: 10 }}>Synthetic schedule — for demonstration only.</div>
      </>
    );
  };

  return (
    <div className="no-det no-glass" role="dialog" aria-label="Network element details">
      {detail.type === 'block' && renderBlock(detail.data)}
      {detail.type === 'station' && renderStation(detail.data, detail.trains || [])}
      {detail.type === 'corridor' && renderCorridor(detail.data, detail.blocks || [])}
      {detail.type === 'train' && renderTrain(detail.data)}
    </div>
  );
}
