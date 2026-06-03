import { useState } from 'react';
import { TextField, Button } from '@shopify/polaris';

const DEMO_STORES = [
  { name: 'Gymshark', url: 'https://gymshark.com' },
  { name: 'Allbirds', url: 'https://allbirds.com' },
  { name: 'Death Wish Coffee', url: 'https://deathwishcoffee.com' },
  { name: 'Brooklinen', url: 'https://brooklinen.com' },
];

interface Props {
  onScan: (url: string) => void;
}

export default function LandingPage({ onScan }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Enter a Shopify store URL to scan');
      return;
    }
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    try {
      new URL(normalized);
    } catch {
      setError('That doesn\'t look like a valid URL');
      return;
    }
    setError('');
    onScan(normalized);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 60%, #0f1117 100%)' }}>

      {/* Badge */}
      <div className="mb-6 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
        style={{ background: 'rgba(92,106,196,0.2)', color: '#a5b4fc', border: '1px solid rgba(92,106,196,0.3)' }}>
        Powered by Groq · llama3-70b
      </div>

      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-4 tracking-tight">
        Access<span style={{ color: '#5C6AC4' }}>Scan</span>
      </h1>
      <p className="text-lg text-gray-400 text-center mb-10 max-w-md">
        Paste any Shopify store URL. Get a full WCAG 2.1 report with AI-generated code fixes — in seconds.
      </p>

      {/* Input */}
      <div className="w-full max-w-xl mb-4" onKeyDown={handleKeyDown}>
        <TextField
          label=""
          labelHidden
          value={url}
          onChange={setUrl}
          placeholder="https://yourstore.myshopify.com"
          autoComplete="off"
          error={error || undefined}
          connectedRight={
            <Button variant="primary" onClick={handleSubmit} size="large">
              Audit Store
            </Button>
          }
        />
      </div>

      {/* Demo stores */}
      <p className="text-sm text-gray-500 mb-3">Or try a demo store:</p>
      <div className="flex flex-wrap gap-2 justify-center mb-16">
        {DEMO_STORES.map((store) => (
          <button
            key={store.url}
            onClick={() => onScan(store.url)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#e5e7eb',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(92,106,196,0.2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(92,106,196,0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {store.name}
          </button>
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex gap-8 text-center">
        {[
          { value: '9', label: 'WCAG categories' },
          { value: '100', label: 'Point scale' },
          { value: 'Free', label: 'No login needed' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl font-bold" style={{ color: '#5C6AC4' }}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
