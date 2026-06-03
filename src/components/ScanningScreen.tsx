import { useEffect, useState } from 'react';
import { fetchHTML } from '../lib/fetcher';
import { extractViolations } from '../lib/extractor';
import { runGroqAudit } from '../lib/groq';
import { computeScore } from '../lib/scorer';
import type { AuditResult } from '../types';

const STEPS = [
  'Connecting to store',
  'Fetching page HTML',
  'Parsing DOM structure',
  'Running 9 WCAG checks',
  'AI-powered analysis',
  'Building your report',
];

interface Props {
  url: string;
  onComplete: (result: AuditResult) => void;
  onError: (msg: string) => void;
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function ScanningScreen({ url, onComplete, onError }: Props) {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setStep(0);
        await delay(400);
        if (cancelled) return;

        setStep(1);
        const html = await fetchHTML(url);
        if (cancelled) return;

        setStep(2);
        await delay(300);
        if (cancelled) return;

        setStep(3);
        const { violations: extracted, snippets } = extractViolations(html);
        if (cancelled) return;

        setStep(4);
        let result: AuditResult;
        try {
          result = await runGroqAudit(url, snippets, extracted);
        } catch {
          // Graceful degradation — use rule-based results
          const { score, grade } = computeScore(extracted);
          const critCount = extracted.filter((v) => v.severity === 'Critical').length;
          result = {
            violations: extracted,
            score,
            grade,
            summary: `Automated scan of ${url} found ${extracted.length} accessibility issues. ${critCount} critical violation${critCount !== 1 ? 's' : ''} require immediate attention. AI analysis was unavailable — results are based on rule-based checks.`,
            top_fixes: [
              'Add descriptive alt text to all images so screen reader users understand their content',
              'Associate every form input with a visible label using the for/id pattern',
              'Ensure all interactive buttons have an accessible name via text content or aria-label',
            ],
            url,
            scannedAt: new Date().toISOString(),
          };
        }
        if (cancelled) return;

        // Local scorer is authoritative
        const { score, grade } = computeScore(result.violations);
        result.score = score;
        result.grade = grade;

        setStep(5);
        await delay(700);
        if (cancelled) return;

        onComplete(result);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Scan failed';
          setErrorMsg(msg);
          onError(msg);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 60%, #0f1117 100%)' }}>

      {/* Pulse ring */}
      <div className="relative mb-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(92,106,196,0.15)', border: '2px solid rgba(92,106,196,0.4)' }}>
          <svg className="animate-spin w-8 h-8" style={{ color: '#5C6AC4' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mb-1">Scanning store</h2>
      <p className="text-sm mb-10" style={{ color: '#5C6AC4' }}>{displayUrl}</p>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {STEPS.map((label, i) => {
          const isDone = i < step;
          const isActive = i === step;
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isDone ? '#5C6AC4' : isActive ? 'rgba(92,106,196,0.2)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '2px solid #5C6AC4' : isDone ? 'none' : '2px solid rgba(255,255,255,0.1)',
                }}>
                {isDone ? (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#5C6AC4' }} />
                ) : null}
              </div>
              <span className="text-sm transition-all"
                style={{
                  color: isDone ? '#6b7280' : isActive ? '#e5e7eb' : '#374151',
                  fontWeight: isActive ? 500 : 400,
                }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="mt-8 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
          {errorMsg}
        </div>
      )}
    </main>
  );
}
