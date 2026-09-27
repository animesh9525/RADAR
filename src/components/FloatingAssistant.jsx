import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildFloatingReply, quickWhere } from '../services/assistant';

export function FloatingAssistant() {
  const { session } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me about conflicts, approvals, recommendations or where to find things.' },
  ]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput('');
    const reply = buildFloatingReply(q, session, '');
    const route = quickWhere(q, session);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: reply, route }]);
    }, 250);
  };

  return (
    <>
      <button
        className="floating-ai-btn"
        title="AI Assistant"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X width={20} height={20} /> : <Sparkles width={20} height={20} />}
      </button>

      {open && (
        <div className="floating-ai-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14 }}>
              <Sparkles width={16} height={16} color="var(--purple)" /> RADAR Assistant
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}><X width={15} height={15} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                background: m.role === 'user' ? 'linear-gradient(135deg,#3d8bfd,#2568e1)' : 'var(--card-2)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                padding: '8px 11px', borderRadius: 'var(--radius-sm)', fontSize: 12.5, lineHeight: 1.55,
                boxShadow: m.role === 'user' ? '0 2px 6px -2px rgba(37,102,225,.4)' : 'var(--shadow-xs)',
              }}>
                <span dangerouslySetInnerHTML={{ __html: m.text }} />
                {m.route && (
                  <div style={{ marginTop: 6 }}>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => { navigate(m.route); setOpen(false); }}>Take me there</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid var(--border)' }} onSubmit={e => { e.preventDefault(); send(); }}>
            <input className="field-input" placeholder="Ask…" value={input} onChange={e => setInput(e.target.value)} />
            <button className="btn btn-primary btn-sm" type="submit"><Send width={14} height={14} /></button>
          </form>
        </div>
      )}
    </>
  );
}