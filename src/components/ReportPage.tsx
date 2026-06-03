import type { AuditResult } from '../types';
import ScoreHeader from './ScoreHeader';
import ChartsSection from './ChartsSection';
import ViolationList from './ViolationCard';
import FixSummary from './FixSummary';

interface Props {
  result: AuditResult;
  onReset: () => void;
}

export default function ReportPage({ result, onReset }: Props) {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold" style={{ color: '#5C6AC4' }}>AccessScan</span>
          <button
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← New scan
          </button>
        </div>

        <ScoreHeader result={result} />
        <ChartsSection result={result} />

        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {result.violations.length} Violation{result.violations.length !== 1 ? 's' : ''} Found
        </h2>
        <ViolationList violations={result.violations} />

        <FixSummary result={result} onReset={onReset} />
      </div>
    </div>
  );
}
