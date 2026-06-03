import type { Grade, Violation } from '../types';

const DEDUCTIONS: Record<string, number> = {
  Critical: 10,
  Serious: 5,
  Moderate: 2,
  Minor: 1,
};

export function computeScore(violations: Violation[]): { score: number; grade: Grade } {
  const score = Math.max(
    0,
    violations.reduce((acc, v) => acc - (DEDUCTIONS[v.severity] ?? 0), 100),
  );

  const grade: Grade =
    score >= 90 ? 'A' :
    score >= 75 ? 'B' :
    score >= 60 ? 'C' :
    score >= 40 ? 'D' : 'F';

  return { score, grade };
}
