import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X, ChevronLeft, ChevronRight, Presentation, Database, ClipboardList, Gauge, Blocks, AlertTriangle, Sparkles, GitBranch, BarChart3, CheckCircle, RadioTower, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEMO_TASK = 'T102';
const DEMO_BLOCK = 'B-042';

const STEPS = [
  {
    title: 'The Mission',
    icon: Presentation,
    screen: '/',
    callout: 'Railway maintenance needs track access — but each block must be coordinated with train movements, crews and conflicting work. AI-ABPS turns maintenance tasks, asset condition, train schedule and resources into <b>coordinated, explainable block plans</b> — with a human always authorizing the final decision.',
    highlight: null,
  },
  {
    title: 'Data & Integration',
    icon: Database,
    screen: '/settings',
    callout: 'Planning inputs flow through one structured pipeline: <b>maintenance tasks, block data, train schedule, crews & equipment</b> — validated before import. Source: <b>Synthetic Demonstration Dataset</b> (same shape a future TMS/SMMS/TDMS feed would fill). Prototype — not a live railway data feed.',
    highlight: '.panel',
    delay: 300,
  },
  {
    title: 'The Triggering Task',
    icon: ClipboardList,
    screen: '/tasks',
    callout: `It starts with a requirement — <b>${DEMO_TASK} · Critical Track Defect</b>, CRITICAL and overdue by 3 days on Corridor C1. Maintenance needs a block of track access; the AI evaluates priority before proposing the window.`,
    highlight: `[data-task-id="${DEMO_TASK}"]`,
    delay: 150,
  },
  {
    title: 'AI Priority Score',
    icon: Gauge,
    screen: '/tasks',
    callout: `Every task scores 0–100 (prototype) from five weighted factors — <b>Safety 30% · Asset 25% · Urgency 20% · Delay 15% · Operational 10%</b>. ${DEMO_TASK} is <b>Critical</b> (score ≥85): high safety criticality, overdue urgency. Rule-based prototype score — not a trained ML model.`,
    highlight: `[data-task-id="${DEMO_TASK}"]`,
    action: 'openTaskModal',
    delay: 150,
  },
  {
    title: `Candidate Block (${DEMO_BLOCK})`,
    icon: Blocks,
    screen: '/tasks',
    callout: `Block <b>${DEMO_BLOCK}</b> bundles T102 + S143 + O221 on Corridor C1 (Monday, 12:00–14:00, 120 min, 92% utilization). The AI proposes it after checking location, duration, resource capacity and operational constraint compatibility.`,
    highlight: `[data-block-id="${DEMO_BLOCK}"]`,
    action: 'openBlockModal',
    delay: 150,
  },
  {
    title: 'Conflict Detection',
    icon: AlertTriangle,
    screen: '/conflicts',
    callout: `Feasibility checks surface what must be resolved: <b>T-204 Express (13:00–13:30, Monday, C1)</b> overlaps the block window, and the Traction crew is short. The Conflict Center flags each issue with severity and an AI resolution.`,
    highlight: '.alert',
    delay: 180,
  },
  {
    title: 'AI Recommendation / Planner',
    icon: Sparkles,
    screen: '/ai-planning',
    callout: `The explainable planner recommends a window and reasoning for every block (for ${DEMO_BLOCK}: resolve the train overlap by keeping clear of 13:00–13:30). <b>Run AI Optimization</b> re-scores the plan with the loaded data — drafts remain recommendations until a human approves. Prototype engine on synthetic data.`,
    highlight: '.btn-primary',
    delay: 160,
  },
  {
    title: 'What-If Simulation',
    icon: GitBranch,
    screen: '/what-if',
    callout: `Before committing, test the change: move ${DEMO_BLOCK} to an early clear window (08:00–10:00) and add reserve crew. The simulation reuses the <b>same conflict, suitability and recommendation engine</b> and compares original vs modified — decide only when confident.`,
    highlight: '.btn-primary',
    delay: 180,
  },
  {
    title: 'Before vs After AI Optimization',
    icon: BarChart3,
    screen: '/what-if',
    callout: 'Prototype <b>Before/After</b> comparison: Conflicts, Train Schedule Conflicts, Resource Conflicts, High-Priority Tasks Blocked, Effective Utilization and Blocks Needing Review — plus a change list. Nothing is applied to the planner until an authorized human approves.',
    highlight: '.panel',
    delay: 200,
  },
  {
    title: 'Approval Workflow',
    icon: CheckCircle,
    screen: '/approval',
    callout: `AI recommendations queue for <b>human authorization</b>. A planner or authority reviews the block, checks explanation, verifies constraints, then approves or rejects. Every change is logged in the audit trail with timestamp, user, and reason.`,
    highlight: '.panel',
    delay: 150,
  },
  {
    title: 'Network Operations',
    icon: RadioTower,
    screen: '/network',
    callout: 'Live control room view: SVG railway topology overlaid on satellite imagery, real-time conflict markers, animated train movements, and interactive block inspection. Pan, zoom, filter by corridor — operational awareness at a glance.',
    highlight: '#noSvg',
    delay: 200,
  },
  {
    title: 'Success',
    icon: Trophy,
    screen: '/',
    callout: 'AI-ABPS delivers <b>coordinated, explainable, human-approved</b> maintenance block plans. From task intake to conflict-free execution — intelligent automation meets railway operational reality. <b>Prototype demonstration complete.</b>',
    highlight: '.app-card',
    delay: 150,
  },
];

export function DemoWalkthrough() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { openTaskModal, openBlockModal } = useApp();

  const currentStep = STEPS[step];

  useEffect(() => {
    if (!active) return;

    // Navigate to screen
    navigate(currentStep.screen);

    // Wait for navigation, then highlight
    const timer = setTimeout(() => {
      clearHighlights();
      if (currentStep.highlight) {
        const el = document.querySelector(currentStep.highlight);
        if (el) {
          el.classList.add('sih-highlight');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Execute action
      if (currentStep.action === 'openTaskModal') {
        setTimeout(() => openTaskModal && openTaskModal(DEMO_TASK), 400);
      } else if (currentStep.action === 'openBlockModal') {
        setTimeout(() => openBlockModal && openBlockModal(DEMO_BLOCK), 400);
      }
    }, currentStep.delay || 150);

    return () => clearTimeout(timer);
  }, [active, step, navigate, currentStep, openTaskModal, openBlockModal]);

  function clearHighlights() {
    document.querySelectorAll('.sih-highlight').forEach(el => el.classList.remove('sih-highlight'));
  }

  const start = () => {
    setStep(0);
    setActive(true);
  };

  const exit = () => {
    setActive(false);
    clearHighlights();
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      exit();
    }
  };

  const prev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!active) {
    return (
      <button
        className="btn btn-primary"
        onClick={start}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(59,130,246,.4)',
        }}
      >
        <Play width={16} height={16} /> Start SIH Demo
      </button>
    );
  }

  const Icon = currentStep.icon;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'var(--card)',
        border: '2px solid var(--blue)',
        borderRadius: 16,
        padding: 20,
        maxWidth: 700,
        boxShadow: '0 12px 40px rgba(0,0,0,.5)',
      }}
    >
      <button
        onClick={exit}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'transparent',
          border: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
        }}
      >
        <X width={18} height={18} />
      </button>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon width={24} height={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', letterSpacing: .5, marginBottom: 4 }}>
            STEP {step + 1} OF {STEPS.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            {currentStep.title}
          </div>
          <div
            style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text2)' }}
            dangerouslySetInnerHTML={{ __html: currentStep.callout }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          SIH 2026 Interactive Demo Walkthrough
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={prev} disabled={step === 0}>
            <ChevronLeft width={14} height={14} /> Previous
          </button>
          <button className="btn btn-primary btn-sm" onClick={next}>
            {step === STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight width={14} height={14} />
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: 4,
          background: 'var(--border)',
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--blue), var(--purple))',
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
