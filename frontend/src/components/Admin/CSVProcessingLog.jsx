import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

// ─── per-type config ──────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  ERROR: {
    icon:    AlertCircle,
    bar:     'bg-red-500',
    bg:      'bg-red-50',
    border:  'border-red-200',
    text:    'text-red-800',
    label:   'text-red-500',
    badge:   'bg-red-100 text-red-700 ring-red-200',
  },
  WARN: {
    icon:    AlertTriangle,
    bar:     'bg-amber-400',
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    text:    'text-amber-800',
    label:   'text-amber-500',
    badge:   'bg-amber-100 text-amber-700 ring-amber-200',
  },
  SUCCESS: {
    icon:    CheckCircle,
    bar:     'bg-emerald-500',
    bg:      'bg-emerald-50',
    border:  'border-emerald-200',
    text:    'text-emerald-800',
    label:   'text-emerald-500',
    badge:   'bg-emerald-100 text-emerald-700 ring-emerald-200',
  },
  INFO: {
    icon:    Info,
    bar:     'bg-sky-400',
    bg:      'bg-slate-50',
    border:  'border-slate-200',
    text:    'text-slate-700',
    label:   'text-sky-500',
    badge:   'bg-sky-100 text-sky-700 ring-sky-200',
  },
  SUMMARY: {
    icon:    CheckCircle,
    bar:     'bg-violet-500',
    bg:      'bg-violet-50',
    border:  'border-violet-200',
    text:    'text-violet-900',
    label:   'text-violet-500',
    badge:   'bg-violet-100 text-violet-700 ring-violet-200',
  },
};

const FALLBACK_CONFIG = {
  icon:    Info,
  bar:     'bg-slate-400',
  bg:      'bg-slate-50',
  border:  'border-slate-200',
  text:    'text-slate-700',
  label:   'text-slate-400',
  badge:   'bg-slate-100 text-slate-600 ring-slate-200',
};

// ─── LogRow ───────────────────────────────────────────────────────────────────

function LogRow({ log, index }) {
  const cfg     = TYPE_CONFIG[log.type] || FALLBACK_CONFIG;
  const Icon    = cfg.icon;
  const isSum   = log.type === 'SUMMARY';

  return (
    <div
      className={`
        flex items-start gap-3 px-3 py-2 rounded-md border
        ${cfg.bg} ${cfg.border}
        ${isSum ? 'mt-1' : ''}
        transition-all duration-150
      `}
      style={{
        animationDelay: `${Math.min(index * 18, 300)}ms`,
        animation: 'fadeSlideIn 0.22s ease both',
      }}
    >
      {/* left colour bar */}
      <div className={`self-stretch w-0.5 rounded-full flex-shrink-0 ${cfg.bar}`} />

      {/* icon */}
      <Icon
        size={14}
        className={`flex-shrink-0 mt-0.5 ${cfg.label}`}
        strokeWidth={2.2}
      />

      {/* message */}
      <p className={`text-xs leading-relaxed flex-1 whitespace-pre-wrap font-mono ${cfg.text} ${isSum ? 'font-semibold' : ''}`}>
        {log.message}
      </p>

      {/* optional type badge */}
      {log.type !== 'INFO' && (
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ring-1 flex-shrink-0 mt-0.5 ${cfg.badge}`}>
          {log.type}
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CSVProcessingLog({ logs = [] }) {
  const scrollRef  = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, collapsed]);

  if (!logs || logs.length === 0) return null;

  // Counts for the header summary pills
  const counts = logs.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {});

  const pillTypes = ['ERROR', 'WARN', 'SUCCESS'];

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* ── header ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
          <Terminal size={14} className="text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold tracking-widest text-slate-300 uppercase flex-1">
            Processing Log
          </span>

          {/* count pills */}
          <div className="flex items-center gap-1.5">
            {pillTypes.map(type =>
              counts[type] ? (
                <span
                  key={type}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${(TYPE_CONFIG[type] || FALLBACK_CONFIG).badge}`}
                >
                  {counts[type]} {type.toLowerCase()}
                </span>
              ) : null
            )}
            <span className="text-[10px] text-slate-500 ml-1">
              {logs.length} line{logs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-2 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={collapsed ? 'Expand log' : 'Collapse log'}
          >
            {collapsed
              ? <ChevronDown size={14} />
              : <ChevronUp   size={14} />
            }
          </button>
        </div>

        {/* ── log body ── */}
        {!collapsed && (
          <div
            ref={scrollRef}
            className="p-3 space-y-1.5 max-h-80 overflow-y-auto bg-white
                       scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
          >
            {logs.map((log, idx) => (
              <LogRow key={idx} log={log} index={idx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}