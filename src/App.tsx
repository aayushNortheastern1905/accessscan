import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ScanningScreen from './components/ScanningScreen';
import ReportPage from './components/ReportPage';
import type { AppState, AuditResult } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);

  function handleScan(targetUrl: string) {
    setUrl(targetUrl);
    setAppState('scanning');
  }

  function handleComplete(auditResult: AuditResult) {
    setResult(auditResult);
    setAppState('report');
  }

  function handleReset() {
    setResult(null);
    setUrl('');
    setAppState('landing');
  }

  if (appState === 'landing') return <LandingPage onScan={handleScan} />;
  if (appState === 'scanning') return (
    <ScanningScreen url={url} onComplete={handleComplete} onError={handleReset} />
  );
  if (appState === 'report' && result) return (
    <ReportPage result={result} onReset={handleReset} />
  );
  return null;
}
