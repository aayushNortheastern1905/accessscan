import { useState } from 'react';

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
    if (!trimmed) { setError('Enter a Shopify store URL'); return; }
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
    try { new URL(normalized); } catch { setError('Not a valid URL'); return; }
    setError('');
    onScan(normalized);
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#08090e',
      backgroundImage: `
        radial-gradient(ellipse 70% 55% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 80% 80%, rgba(92,106,196,0.07) 0%, transparent 60%)
      `,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
      color: '#fff',
      boxSizing: 'border-box',
    }}>

      {/* Top badge */}
      <div style={{
        marginBottom: '2.25rem',
        padding: '0.4rem 1.1rem',
        borderRadius: '999px',
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.28)',
        color: '#a5b4fc',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#818cf8',
          boxShadow: '0 0 6px #818cf8',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        Powered by Groq · Llama3-70B
      </div>

      {/* Heading */}
      <h1 style={{
        fontSize: 'clamp(3.2rem, 9vw, 6rem)',
        fontWeight: 800,
        textAlign: 'center',
        letterSpacing: '-0.035em',
        lineHeight: 1.05,
        margin: '0 0 1.5rem',
      }}>
        Access
        <span style={{
          background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #5C6AC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Scan
        </span>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.15rem',
        color: '#9ca3af',
        textAlign: 'center',
        maxWidth: '440px',
        lineHeight: 1.65,
        margin: '0 0 2.75rem',
      }}>
        Paste any Shopify store URL and get a full WCAG&nbsp;2.1 accessibility report with AI-generated code fixes in seconds.
      </p>

      {/* Input card */}
      <div style={{ width: '100%', maxWidth: '580px', marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.035)',
          border: `1.5px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '16px',
          padding: '6px 6px 6px 0',
          backdropFilter: 'blur(12px)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 0 transparent',
        }}
          onFocusCapture={(e) => {
            if (!error) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.6)';
          }}
          onBlurCapture={(e) => {
            if (!error) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          {/* URL icon */}
          <div style={{ padding: '0 0.875rem', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>

          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="https://yourstore.myshopify.com"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f9fafb',
              fontSize: '0.975rem',
              caretColor: '#818cf8',
            }}
          />

          <button
            onClick={handleSubmit}
            style={{
              flexShrink: 0,
              padding: '0.75rem 1.375rem',
              background: 'linear-gradient(135deg, #6366f1, #5C6AC4)',
              color: '#fff',
              border: 'none',
              borderRadius: '11px',
              fontWeight: 650,
              fontSize: '0.9rem',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s, transform 0.1s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Audit Store →
          </button>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
            {error}
          </p>
        )}
      </div>

      {/* Demo stores */}
      <p style={{ color: '#374151', fontSize: '0.78rem', margin: '0.25rem 0 0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
        or try a demo
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '5rem' }}>
        {DEMO_STORES.map((s) => (
          <button
            key={s.url}
            onClick={() => onScan(s.url)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#9ca3af',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
              e.currentTarget.style.color = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'flex', gap: '3.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { value: '9', label: 'WCAG categories' },
          { value: '100pt', label: 'Scoring scale' },
          { value: 'Free', label: 'No account needed' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.03em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.2rem', fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
