export type Severity = 'Critical' | 'Serious' | 'Moderate' | 'Minor';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type Category =
  | 'Images'
  | 'Forms'
  | 'Navigation'
  | 'ARIA'
  | 'Color'
  | 'Keyboard'
  | 'Headings'
  | 'Buttons'
  | 'Links'
  | 'Language'
  | 'Page Title';

export interface Violation {
  id: string;
  category: Category;
  severity: Severity;
  wcag_rule: string;
  description: string;
  broken_code: string;
  fixed_code: string;
  user_impact: string;
}

export interface AuditResult {
  violations: Violation[];
  score: number;
  grade: Grade;
  summary: string;
  top_fixes: string[];
  url: string;
  scannedAt: string;
}

export type AppState = 'landing' | 'scanning' | 'report';
