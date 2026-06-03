import { useState } from 'react';
import type { Violation, Severity, Category } from '../types';

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; border: string }> = {
  Critical: { bg: 'rgba(220,38,38,0.1)', text: '#DC2626', border: 'rgba(220,38,38,0.2)' },
  Serious:  { bg: 'rgba(234,88,12,0.1)',  text: '#EA580C', border: 'rgba(234,88,12,0.2)'  },
  Moderate: { bg: 'rgba(202,138,4,0.1)',  text: '#CA8A04', border: 'rgba(202,138,4,0.2)'  },
  Minor:    { bg: 'rgba(37,99,235,0.1)',  text: '#2563EB', border: 'rgba(37,99,235,0.2)'  },
};

function CodeBlock({ code, type }: { code: string; type: 'broken' | 'fixed' }) {
  const [copied, setCopied] = useState(false);
  const bg = type === 'broken' ? 'rgba(220,38,38,0.05)' : 'rgba(22,163,74,0.05)';
  const border = type === 'broken' ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)';
  const label = type === 'broken' ? 'Broken' : 'Fixed';
  const labelColor = type === 'broken' ? '#DC2626' : '#16A34A';

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: border, borderBottom: `1px solid ${border}` }}>
        <span className="text-xs font-semibold" style={{ color: labelColor }}>{label}</span>
        {type === 'fixed' && (
          <button onClick={copy}
            className="text-xs px-2 py-0.5 rounded transition-all"
            style={{ color: copied ? '#16A34A' : '#6b7280', background: 'rgba(255,255,255,0.6)' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
      <pre className="code-block p-3 overflow-x-auto text-xs"
        style={{ background: bg, margin: 0, color: '#1f2937' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface CardProps {
  violation: Violation;
}

function ViolationCard({ violation }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_STYLES[violation.severity];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
          {violation.severity}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {violation.category}
        </span>
        <span className="text-xs text-gray-400 font-mono ml-auto">{violation.wcag_rule}</span>
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-gray-900 mb-1">{violation.description}</p>
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-medium text-gray-700">Impact: </span>
        {violation.user_impact}
      </p>

      {/* Code toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="text-xs font-medium mb-3 flex items-center gap-1 transition-colors"
        style={{ color: '#5C6AC4' }}>
        <svg className="w-3 h-3 transition-transform" style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          viewBox="0 0 12 12" fill="currentColor">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        {expanded ? 'Hide' : 'Show'} code diff
      </button>

      {expanded && (
        <div className="flex flex-col gap-3">
          <CodeBlock code={violation.broken_code} type="broken" />
          <CodeBlock code={violation.fixed_code} type="fixed" />
        </div>
      )}
    </div>
  );
}

const ALL_SEVERITIES: Severity[] = ['Critical', 'Serious', 'Moderate', 'Minor'];

interface ListProps {
  violations: Violation[];
}

export default function ViolationList({ violations }: ListProps) {
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');

  const categories = ['All', ...new Set(violations.map((v) => v.category))] as (Category | 'All')[];
  const severities: (Severity | 'All')[] = ['All', ...ALL_SEVERITIES.filter((s) =>
    violations.some((v) => v.severity === s)
  )];

  const filtered = violations
    .filter((v) => severityFilter === 'All' || v.severity === severityFilter)
    .filter((v) => categoryFilter === 'All' || v.category === categoryFilter)
    .sort((a, b) => ALL_SEVERITIES.indexOf(a.severity) - ALL_SEVERITIES.indexOf(b.severity));

  const severityColors: Record<string, string> = {
    Critical: '#DC2626', Serious: '#EA580C', Moderate: '#CA8A04', Minor: '#2563EB', All: '#5C6AC4',
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Severity filter */}
        <div className="flex flex-wrap gap-2">
          {severities.map((s) => (
            <button key={s} onClick={() => setSeverityFilter(s)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: severityFilter === s ? severityColors[s] : 'rgba(255,255,255,0)',
                color: severityFilter === s ? 'white' : severityColors[s] ?? '#6b7280',
                border: `1px solid ${severityColors[s] ?? '#e5e7eb'}`,
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
          className="ml-auto text-xs rounded-lg px-3 py-1.5 border border-gray-200 bg-white text-gray-700 cursor-pointer">
          {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} violation{filtered.length !== 1 ? 's' : ''} shown</p>

      <div className="flex flex-col gap-4">
        {filtered.map((v) => <ViolationCard key={v.id} violation={v} />)}
      </div>
    </div>
  );
}
