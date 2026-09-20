import React from 'react';
import { X, CheckCircle, AlertTriangle, Clock, MapPin, Wrench, Sparkles } from 'lucide-react';
import { Modal, Badge, ProgressBar } from './ui';
import { calculatePriorityScore } from '../services/ai';

export function TaskModal({ task, onClose, onAssignToBlock }) {
  if (!task) return null;

  const priority = calculatePriorityScore(task);
  const factors = [
    { label: 'Safety Criticality', value: priority.factors.safety || 0, weight: '30%', color: 'var(--red)' },
    { label: 'Asset Importance', value: priority.factors.asset || 0, weight: '25%', color: 'var(--orange)' },
    { label: 'Urgency', value: priority.factors.urgency || 0, weight: '20%', color: 'var(--blue)' },
    { label: 'Overdue/Delay', value: priority.factors.overdue || 0, weight: '15%', color: 'var(--purple)' },
    { label: 'Operational Impact', value: priority.factors.operational || 0, weight: '10%', color: 'var(--green)' },
  ];

  const getCategoryColor = (score) => {
    if (score >= 85) return 'var(--red)';
    if (score >= 70) return 'var(--orange)';
    if (score >= 50) return 'var(--blue)';
    return 'var(--green)';
  };

  const getCategoryLabel = (score) => {
    if (score >= 85) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <Modal open onClose={onClose}>
      <div style={{ width: '100%', maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{task.id}</h2>
              <Badge tone={priority.category === 'CRITICAL' ? 'high' : priority.category === 'HIGH' ? 'medium' : 'low'}>
                {getCategoryLabel(priority.score)}
              </Badge>
            </div>
            <div style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 4 }}>{task.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              <Badge tone="low">{task.department}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X width={18} height={18} />
          </button>
        </div>

        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles width={16} height={16} color="var(--purple)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>AI PRIORITY SCORE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: getCategoryColor(priority.score) }}>
              {priority.score}
            </span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ 100</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: getCategoryColor(priority.score), marginLeft: 'auto' }}>
              {getCategoryLabel(priority.score)} PRIORITY
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
            Rule-based weighted score from five factors (prototype, not trained ML)
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {factors.map((f, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ color: 'var(--muted)' }}>
                    {f.value} <span style={{ color: 'var(--muted)', fontSize: 11 }}>({f.weight})</span>
                  </span>
                </div>
                <ProgressBar value={f.value} color={f.color} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>DETAILS</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Duration:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{task.duration || '60 min'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Location:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{task.location || task.corridor || 'TBD'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench width={14} height={14} color="var(--muted)" />
                <span style={{ color: 'var(--muted)' }}>Department:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{task.department}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>STATUS</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {task.status === 'Scheduled' ? (
                  <CheckCircle width={14} height={14} color="var(--green)" />
                ) : (
                  <AlertTriangle width={14} height={14} color="var(--orange)" />
                )}
                <span style={{ color: 'var(--muted)' }}>Status:</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{task.status || 'Pending'}</span>
              </div>
              {task.overdueDays && task.overdueDays > 0 && (
                <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>
                  ⚠️ Overdue by {task.overdueDays} days
                </div>
              )}
            </div>
          </div>
        </div>

        {task.description && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>DESCRIPTION</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text2)' }}>{task.description}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" onClick={() => onAssignToBlock && onAssignToBlock(task)}>
            <CheckCircle width={16} height={16} /> Assign to Block
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ marginTop: 12, padding: 10, background: 'rgba(59,130,246,.08)', borderRadius: 8, fontSize: 11, color: 'var(--muted)' }}>
          💡 <b>Synthetic Demo:</b> Priority scores computed from task metadata using rule-based weights. Production version would integrate with TMS/SMMS real-time feeds.
        </div>
      </div>
    </Modal>
  );
}
