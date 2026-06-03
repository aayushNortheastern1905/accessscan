import type { AuditResult } from '../types';

interface Props {
  result: AuditResult;
  onReset: () => void;
}

export default function FixSummary({ result, onReset }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-10">
      <h3 className="text-base font-semibold text-gray-900 mb-5">Top Recommended Fixes</h3>

      <div className="flex flex-col gap-4 mb-8">
        {result.top_fixes.slice(0, 3).map((fix, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: i === 0 ? '#DC2626' : i === 1 ? '#EA580C' : '#CA8A04' }}>
              {i + 1}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{fix}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6V2h8v4M3 6h10a1 1 0 0 1 1 1v5H2V7a1 1 0 0 1 1-1ZM5 11v3h6v-3" strokeLinecap="round" />
          </svg>
          Download Report
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: '#5C6AC4' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4959BD'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#5C6AC4'; }}>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8a6 6 0 1 0 1-3.3" strokeLinecap="round" />
            <path d="M2 2v4h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Scan Another Store
        </button>
      </div>
    </div>
  );
}
