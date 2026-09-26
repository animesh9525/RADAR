import React, { useMemo } from 'react';
import { X, AlertTriangle, GitBranch, Trash2, Edit3, MapPin, Clock, Users, Wrench, Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal, Badge, ProgressBar } from './ui';
import { makeAnalyzer } from '../utils/analyzer';

export function BlockModal({ block, trains, taskData, onClose, onEdit, onDelete }) {
  const navigate = useNavigate();

  const analyzer = useMemo(() => {
    if (!block) return null;
    return makeAnalyzer([block], trains, taskData);
  }, [block, trains, taskData]);

  if (!block || !analyzer) return null;

  const analysis = analyzer.analyze(block);
  const suitability = analyzer.sui(block);
  const priority = analyzer.pri(block);
  const recommendation = analyzer.rec(block);

  const conflictLabel = analysis.hasCritical ? 'CRITICAL' : analysis.hasConflict ? 'WARNING' : 'CLEAR';

  const suitabilityFactors = [
    { label: 'Train Impact', value: suitability.factors.trainImpact || 0, color: 'var(--blue)' },
    { label: 'Time Slot Quality', value: suitability.factors.timeSlot || 0, color: 'var(--purple)' },
    { label: 'Resource Availability', value: suitability.factors.resourceAvail || 0, color: 'var(--green)' },
    { label: 'Conflict-Free', value: suitability.factors.conflictFree || 0, color: 'var(--orange)' },
    { label: 'Asset Condition', value: suitability.factors.assetCondition || 0, color: 'var(--red)' },
  ];

  const departments = [...new Set((block.tasks || []).map(t => t.department))];

  const handleWhatIf = () => {
    navigate('/what-if', { state: { selectedBlock: block.id } });
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <div style={{ width: '100%', maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{block.id}</h2>
              <Badge tone={analysis.hasCritical ? 'high' : analysis.hasConflict ? 'medium' : 'low'}>
                {conflictLabel}
              </Badge>
              <Badge tone="low">{block.type || 'SINGLE'}</Badge>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {block.corridor} · {block.date} · {block.startTime}–{block.endTime}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X width={18} height={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>BLOCK DETAILS</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Location:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{block.from} → {block.to}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Duration:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{block.duration || '120 min'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Track:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{block.track}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Priority:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{block.priority || 'MEDIUM'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Utilization:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{block.utilization || '75%'}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>RESOURCES</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Crew:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {block.requiredCrew || 0} req / {block.availableCrew || 0} avail
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Equipment:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{block.requiredEquip || 'General'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Status:</span>
                <Badge tone={block.equipmentStatus === 'AVAILABLE' ? 'low' : 'medium'}>
                  {block.equipmentStatus || 'AVAILABLE'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {analysis.all.length > 0 && (
          <div style={{ marginBottom: 20, padding: 14, background: 'rgba(239,68,68,.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertTriangle width={16} height={16} color="var(--red)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)' }}>CONFLICTS ({analysis.all.length})</span>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {analysis.all.map((conf, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text2)', padding: 8, background: 'var(--surface)', borderRadius: 6 }}>
                  <b>{conf.type === 'train' ? `TRAIN ${conf.trainId}` : String(conf.type).toUpperCase()}</b> · {conf.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {block.tasks && block.tasks.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>TASKS ({block.tasks.length})</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {block.tasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{t.id} · {t.name}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge tone="low">{t.department}</Badge>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>{t.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              <b>Departments:</b> {departments.join(', ')}
            </div>
          </div>
        )}

        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles width={16} height={16} color="var(--purple)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>AI SUITABILITY SCORE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: suitability.score >= 90 ? 'var(--green)' : suitability.score >= 70 ? 'var(--blue)' : 'var(--orange)' }}>
              {suitability.score}
            </span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ 100</span>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {suitabilityFactors.map((f, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ color: 'var(--muted)' }}>{f.value}</span>
                </div>
                <ProgressBar value={f.value} color={f.color} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 }}>AI RECOMMENDATION</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{recommendation.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{recommendation.reason}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Confidence: <b style={{ color: 'var(--purple)' }}>{priority.strength}%</b> · AI Priority Score: <b>{priority.score}</b>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" onClick={handleWhatIf}>
            <GitBranch width={16} height={16} /> Analyze Impact (What-If)
          </button>
          {onEdit && (
            <button className="btn btn-secondary" onClick={() => { onEdit(block); onClose(); }}>
              <Edit3 width={16} height={16} /> Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-secondary" onClick={() => { onDelete(block.id); onClose(); }} style={{ marginLeft: 'auto' }}>
              <Trash2 width={16} height={16} /> Delete
            </button>
          )}
        </div>

        <div style={{ marginTop: 12, padding: 10, background: 'rgba(59,130,246,.08)', borderRadius: 8, fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <Lightbulb width={13} height={13} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 1 }} />
          <span><b>Prototype AI:</b> Suitability and conflict scores computed from block metadata, train schedule, and resource availability using rule-based engine.</span>
        </div>
      </div>
    </Modal>
  );
}
