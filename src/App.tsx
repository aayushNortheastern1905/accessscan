import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ScanningScreen from './components/ScanningScreen';
import ReportPage from './components/ReportPage';
import type { AppState, AuditResult } from './types';

function getInitialState(): { state: AppState; url: string } {
  const param = new URLSearchParams(window.location.search).get('url');
  if (param) return { state: 'scanning', url: param };
  return { state: 'landing', url: '' };
}

export default function App() {
  const initial = getInitialState();
  const [appState, setAppState] = useState<AppState>(initial.state);
  const [url, setUrl] = useState(initial.url);
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
    // Clear the ?url= param so landing page shows clean
    window.history.replaceState({}, '', '/');
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
