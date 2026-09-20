import React from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, ArrowRight, Database } from 'lucide-react';

export function LoginScreen() {
  const { login, datasource } = useApp();
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--navy)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,.12), transparent 40%)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 14px', borderRadius: 18, background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(59,130,246,.4)' }}>
            <Cpu width={30} height={30} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontWeight: 900 }}>AI-ABPS</h1>
          <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 6 }}>AI-driven Block Planning &amp; Scheduling System</p>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 30px 60px rgba(0,0,0,.3)', padding: 26 }}>
          <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 18 }}>Prototype Access</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 18px' }}>Sign in to explore the AI-assisted block planning workflow with the synthetic demo dataset.</p>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={() => login('Demo Planner', 'Planner')}>
            Continue as Demo Planner <ArrowRight width={16} height={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
            <Database width={13} height={13} />
            {datasource?.label || 'Synthetic Demo Dataset'} · deterministic
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 16 }}>prototype · synthetic data · not for operational use</p>
      </div>
    </div>
  );
}