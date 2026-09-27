import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, CalendarDays, ClipboardList, Waypoints } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Client-side search over the live application dataset (AppContext). No second
// data source: blocks, tasks and corridors are exactly what the app renders.
const MAX_PER_GROUP = 4;
const MAX_TOTAL = 9;

const norm = (v) => String(v == null ? '' : v).toLowerCase();

function taskTitle(t) {
  const raw = t.title || '';
  const parts = raw.split('·');
  return (parts.length > 1 ? parts.slice(1).join('·') : raw).trim() || raw.trim();
}

function score(haystacks, q, exactField) {
  const id = norm(exactField);
  if (id === q) return 0;
  if (id.startsWith(q)) return 1;
  if (id.includes(q)) return 2;
  for (let i = 0; i < haystacks.length; i++) {
    const h = norm(haystacks[i]);
    if (!h) continue;
    if (h.startsWith(q)) return 3;
    if (h.includes(q)) return 4;
  }
  return -1;
}

export function GlobalSearch() {
  const { blocks, tasks, corridors } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const q = useMemo(() => query.trim().toLowerCase(), [query]);

  const groups = useMemo(() => {
    if (!q) return null;

    const blockHits = [];
    blocks.forEach(b => {
      const s = score([b.corridor, b.track, b.date, b.from, b.to, b.type, (b.tasks || []).map(t => t.id).join(' ')], q, b.id);
      if (s >= 0) blockHits.push({ s, kind: 'block', id: b.id, title: b.id, sub: `${b.corridor} / ${b.track} · ${b.from} → ${b.to}`, meta: `${b.startTime}–${b.endTime}`, data: b });
    });

    const taskHits = [];
    tasks.forEach(t => {
      const s = score([taskTitle(t), t.description, t.reason, t.department, t.corridor, t.block], q, t.id);
      if (s >= 0) taskHits.push({ s, kind: 'task', id: t.id, title: t.id, sub: taskTitle(t) || t.department || '', meta: `${t.corridor || '—'}${t.block ? ' · ' + t.block : ''}`, data: t });
    });

    const corridorHits = [];
    (corridors || []).forEach(c => {
      const stations = (c.stations || []).join(' ');
      const s = score([stations, c.color], q, c.id);
      if (s >= 0) {
        const count = blocks.filter(b => b.corridor === c.id).length;
        corridorHits.push({ s, kind: 'corridor', id: c.id, title: c.id, sub: (c.stations || []).join(' · '), meta: `${count} block${count === 1 ? '' : 's'}`, data: c });
      }
    });

    const by = (a, b) => a.s - b.s || a.id.localeCompare(b.id);
    return [
      { kind: 'block', label: 'Blocks', icon: CalendarDays, items: blockHits.sort(by).slice(0, MAX_PER_GROUP) },
      { kind: 'task', label: 'Tasks', icon: ClipboardList, items: taskHits.sort(by).slice(0, MAX_PER_GROUP) },
      { kind: 'corridor', label: 'Corridors', icon: Waypoints, items: corridorHits.sort(by).slice(0, MAX_PER_GROUP) },
    ].filter(g => g.items.length);
  }, [q, blocks, tasks, corridors]);

  const flat = useMemo(() => (groups ? groups.flatMap(g => g.items.map(i => ({ ...i, group: g.label }))) : []), [groups]);
  const shown = useMemo(() => flat.slice(0, MAX_TOTAL), [flat]);
  const hiddenCount = flat.length - shown.length;


  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (active < 0 || active >= shown.length) return;
    const el = listRef.current && listRef.current.querySelector(`[data-search-index="${active}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, shown.length]);

  const close = useCallback(() => { setOpen(false); setActive(0); }, []);

  const choose = useCallback((item) => {
    if (!item) return;
    close();
    setQuery('');
    if (inputRef.current) inputRef.current.blur();
    if (item.kind === 'block') navigate('/block-planner', { state: { openBlock: item.id } });
    else if (item.kind === 'task') navigate('/tasks', { state: { openTask: item.id } });
    else navigate('/corridor', { state: { focusCorridor: item.id } });
  }, [close, navigate]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (open) { e.stopPropagation(); close(); }
      return;
    }
    if (!q) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive(a => (shown.length ? (a + 1) % shown.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive(a => (shown.length ? (a - 1 + shown.length) % shown.length : 0));
    } else if (e.key === 'Enter') {
      if (open && shown.length) { e.preventDefault(); choose(shown[active]); }
    }
  };

  const showPanel = open && !!q;

  return (
    <div className="top-search" ref={rootRef}>
      <Search width={16} height={16} />
      <input
        ref={inputRef}
        className="field-input"
        data-search-input="1"
        placeholder="Search blocks, tasks, corridors…"
        value={query}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck="false"
        onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onFocus={() => { if (query.trim()) setOpen(true); }}
        onKeyDown={onKeyDown}
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          title="Clear search"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setQuery(''); close(); if (inputRef.current) inputRef.current.focus(); }}
        >
          <X width={13} height={13} />
        </button>
      )}

      {showPanel && (
        <div className="search-pop" id="global-search-results" data-search-results="1" role="listbox">
          {shown.length === 0 ? (
            <div className="search-empty" data-search-empty="1">
              <div className="search-empty-title">No matches for “{query.trim()}”</div>
              <div className="note">Try a block id (B-041), task id (T102) or corridor (C2).</div>
            </div>
          ) : (
            <>
              <div className="search-pop-scroll" ref={listRef}>
                {groups.map(g => {
                  const items = g.items
                    .map(item => ({ item, idx: flat.findIndex(f => f.kind === item.kind && f.id === item.id) }))
                    .filter(x => x.idx >= 0 && x.idx < MAX_TOTAL);
                  if (!items.length) return null;
                  return (
                    <div key={g.kind} className="search-group">
                      <div className="search-group-label">
                        <g.icon width={11} height={11} /> {g.label}
                      </div>
                      {items.map(({ item, idx }) => (
                        <button
                          key={`${item.kind}-${item.id}`}
                          type="button"
                          role="option"
                          aria-selected={idx === active}
                          data-search-item={item.kind}
                          data-search-id={item.id}
                          data-search-index={idx}
                          className={`search-row ${idx === active ? 'active' : ''}`}
                          onMouseEnter={() => setActive(idx)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => choose(item)}
                        >
                          <span className={`search-kind search-kind-${item.kind}`}>{item.kind === 'block' ? 'Block' : item.kind === 'task' ? 'Task' : 'Corridor'}</span>
                          <span className="search-main">
                            <span className="search-id">{item.title}</span>
                            <span className="search-sub">{item.sub}</span>
                          </span>
                          <span className="search-meta">{item.meta}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="search-pop-foot">
                <span>{flat.length} match{flat.length === 1 ? '' : 'es'}{hiddenCount > 0 ? ` · ${hiddenCount} more` : ''}</span>
                <span className="search-hint">↑↓ move · Enter open · Esc close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
