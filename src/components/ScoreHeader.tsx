import { useEffect, useState } from 'react';
import type { AuditResult } from '../types';

function scoreColor(score: number): string {
  if (score >= 90) return '#16A34A';
  if (score >= 75) return '#65A30D';
  if (score >= 60) return '#CA8A04';
  if (score >= 40) return '#EA580C';
  return '#DC2626';
}

function gradeColor(grade: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    A: { bg: 'rgba(22,163,74,0.15)', text: '#16A34A' },
    B: { bg: 'rgba(101,163,13,0.15)', text: '#65A30D' },
    C: { bg: 'rgba(202,138,4,0.15)', text: '#CA8A04' },
    D: { bg: 'rgba(234,88,12,0.15)', text: '#EA580C' },
    F: { bg: 'rgba(220,38,38,0.15)', text: '#DC2626' },
  };
  return map[grade] ?? map['F'];
}

function riskLabel(score: number): string {
  if (score >= 90) return 'Low';
  if (score >= 75) return 'Moderate';
  if (score >= 60) return 'High';
  return 'Critical';
}

interface Props {
  result: AuditResult;
}

export default function ScoreHeader({ result }: Props) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = scoreColor(result.score);
  const { bg: gradeBg, text: gradeText } = gradeColor(result.grade);
  const criticalCount = result.violations.filter((v) => v.severity === 'Critical').length;

  useEffect(() => {
    let current = 0;
    const target = result.score;
    const step = target / 50;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [result.score]);

  const scannedAt = new Date(result.scannedAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Score circle */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.02s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{displayScore}</span>
            <span className="text-xs text-gray-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <span className="text-2xl font-bold text-gray-900">Accessibility Score</span>
            <span className="px-3 py-1 rounded-full text-lg font-bold"
              style={{ background: gradeBg, color: gradeText }}>
              {result.grade}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            {result.url.replace(/^https?:\/\//, '')} · Scanned {scannedAt}
          </p>

          <p className="text-gray-700 text-sm leading-relaxed mb-5 max-w-xl">
            {result.summary}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Violations', value: result.violations.length, color: '#6b7280' },
              { label: 'Critical Issues', value: criticalCount, color: '#DC2626' },
              { label: 'WCAG Level', value: '2.1 AA', color: '#5C6AC4' },
              { label: 'ADA Risk', value: riskLabel(result.score), color: scoreColor(result.score) },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
