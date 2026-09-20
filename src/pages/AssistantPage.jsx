import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { Panel } from '../components/ui';
import { chatAnswer } from '../services/assistant';

const SUGGESTED = [
  'Why was B-042 selected?',
  'Show critical tasks for C1',
  'What if traction crew is unavailable?',
  'Explain task bundling logic',
  'Compare manual vs AI plan',
  'What requires attention?',
];

export function AssistantPage() {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hello! I am your Prototype AI Planning Assistant. Ask me about tasks, blocks, conflicts, approvals or bundling logic.' }]);
  const [input, setInput] = useState('');

  const send = (text) => {
    const q = (text != null ? text : input).trim();
    if (!q) return;
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setTimeout(() => {
      const answer = chatAnswer(q);
      setMessages(m => [...m, { role: 'bot', text: answer }]);
    }, 350);
  };

  return (
    <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr 300px', alignItems: 'start' }}>
      <Panel title="AI Assistant" icon={<Sparkles width={18} height={18} color="var(--purple)" />} bodyClass="" className="">
        <div style={{ height: 440, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background: m.role === 'user' ? 'linear-gradient(135deg,var(--blue),var(--purple))' : 'var(--card)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              padding: '10px 12px', borderRadius: 10, fontSize: 13.5, lineHeight: 1.6,
            }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, opacity: .75, fontSize: 11, fontWeight: 700 }}>
                {m.role === 'user' ? <User width={12} height={12} /> : <Bot width={12} height={12} />}{m.role === 'user' ? 'YOU' : 'AI-ABPS'}
              </div>
              {m.text}
            </div>
          ))}
        </div>
        <form style={{ display: 'flex', gap: 8, marginTop: 14 }} onSubmit={e => { e.preventDefault(); send(); }}>
          <input className="field-input" placeholder="Ask about tasks, blocks, conflicts…" value={input} onChange={e => setInput(e.target.value)} />
          <button className="btn btn-primary" type="submit"><Send width={15} height={15} /> Ask</button>
        </form>
      </Panel>

      <Panel title="Suggested Questions" icon={<Bot width={18} height={18} color="var(--blue)" />}>
        <div style={{ display: 'grid', gap: 8 }}>
          {SUGGESTED.map(q => (
            <button key={q} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => send(q)}>{q}</button>
          ))}
        </div>
        <div className="note" style={{ marginTop: 12 }}>Prototype assistant — deterministic scripted answers over synthetic demo data.</div>
      </Panel>
    </div>
  );
}