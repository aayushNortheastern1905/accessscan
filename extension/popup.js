// ─── Screens ─────────────────────────────────────────────────────────────────
const screens = {
  setup:    document.getElementById('setup'),
  scanning: document.getElementById('scanning'),
  results:  document.getElementById('results'),
  error:    document.getElementById('error'),
};

function show(name) {
  Object.entries(screens).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
}

// ─── WCAG Extractor ───────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }

function extractViolations(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const violations = [], snippets = [];

  function add(v, s) { violations.push(v); snippets.push(s.slice(0, 300)); }

  // 1. Images missing alt
  doc.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('alt')) {
      const s = img.outerHTML.slice(0, 200);
      add({ id: uid(), category: 'Images', severity: 'Critical', wcag_rule: 'WCAG 1.1.1',
        description: 'Image is missing an alt attribute.',
        broken_code: s, fixed_code: s.replace('<img', '<img alt="[describe image]"'),
        user_impact: 'Screen reader users cannot understand this image.' }, s);
    }
  });

  // 2. Inputs missing labels
  doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])').forEach((input) => {
    const id = input.getAttribute('id');
    const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
    const hasAria = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
    if (!hasLabel && !hasAria) {
      const s = input.outerHTML.slice(0, 200);
      add({ id: uid(), category: 'Forms', severity: 'Critical', wcag_rule: 'WCAG 1.3.1',
        description: 'Form input has no associated label.',
        broken_code: s, fixed_code: `<label for="field">Label</label>\n${s}`,
        user_impact: 'Screen reader users cannot identify what this field is for.' }, s);
    }
  });

  // 3. Buttons with no name
  doc.querySelectorAll('button').forEach((btn) => {
    if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
      const s = btn.outerHTML.slice(0, 200);
      add({ id: uid(), category: 'Buttons', severity: 'Critical', wcag_rule: 'WCAG 4.1.2',
        description: 'Button has no accessible name.',
        broken_code: s, fixed_code: s.replace('<button', '<button aria-label="[action]"'),
        user_impact: 'Keyboard and screen reader users cannot determine the button purpose.' }, s);
    }
  });

  // 4. Vague link text
  const vague = new Set(['click here', 'read more', 'learn more', 'here', 'more', 'link']);
  doc.querySelectorAll('a').forEach((a) => {
    const text = (a.textContent?.trim() || '').toLowerCase();
    if (vague.has(text)) {
      const s = a.outerHTML.slice(0, 200);
      add({ id: uid(), category: 'Links', severity: 'Serious', wcag_rule: 'WCAG 2.4.4',
        description: `Link text "${a.textContent?.trim()}" is not descriptive.`,
        broken_code: s, fixed_code: s.replace(a.textContent?.trim() || '', '[Descriptive text]'),
        user_impact: 'Screen reader users navigating by links cannot predict the destination.' }, s);
    }
  });

  // 5. Missing lang on html
  if (!doc.querySelector('html')?.getAttribute('lang')) {
    add({ id: uid(), category: 'Language', severity: 'Serious', wcag_rule: 'WCAG 3.1.1',
      description: '<html> element is missing a lang attribute.',
      broken_code: '<html>', fixed_code: '<html lang="en">',
      user_impact: 'Screen readers cannot select the correct language for pronunciation.' }, '<html>');
  }

  // 6. Broken heading hierarchy
  const headings = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  let prev = 0;
  headings.forEach((h) => {
    const level = parseInt(h.tagName[1]);
    if (prev && level > prev + 1) {
      const s = h.outerHTML.slice(0, 200);
      add({ id: uid(), category: 'Headings', severity: 'Moderate', wcag_rule: 'WCAG 1.3.1',
        description: `Heading skips from h${prev} to h${level}.`,
        broken_code: s, fixed_code: s.replace(new RegExp(`h${level}`, 'g'), `h${prev + 1}`),
        user_impact: 'Broken document structure for screen reader heading navigation.' }, s);
    }
    prev = level;
  });

  // 7. No skip navigation link
  const firstLink = doc.querySelector('a');
  const hasSkip = firstLink?.getAttribute('href')?.startsWith('#') &&
    firstLink?.textContent?.toLowerCase().includes('skip');
  if (!hasSkip) {
    add({ id: uid(), category: 'Navigation', severity: 'Moderate', wcag_rule: 'WCAG 2.4.1',
      description: 'No skip navigation link found.',
      broken_code: '<!-- no skip link -->',
      fixed_code: '<a href="#main-content">Skip to main content</a>',
      user_impact: 'Keyboard users must tab through all nav items on every page.' }, '<!-- no skip link -->');
  }

  // 8. Missing page title
  const title = doc.querySelector('title');
  if (!title || !title.textContent?.trim()) {
    add({ id: uid(), category: 'Page Title', severity: 'Moderate', wcag_rule: 'WCAG 2.4.2',
      description: 'Page is missing a <title> element.',
      broken_code: '<!-- no title -->', fixed_code: '<title>Store — Page</title>',
      user_impact: 'Screen readers cannot identify the page from the browser tab.' }, '<!-- no title -->');
  }

  // 9. ARIA landmarks missing names
  const landmarks = new Set(['dialog', 'alertdialog', 'navigation', 'region', 'form']);
  doc.querySelectorAll('[role]').forEach((el) => {
    const role = el.getAttribute('role') || '';
    if (landmarks.has(role) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
      const s = el.outerHTML.slice(0, 200);
      add({ id: uid(), category: 'ARIA', severity: 'Serious', wcag_rule: 'WCAG 4.1.2',
        description: `Element with role="${role}" has no accessible name.`,
        broken_code: s, fixed_code: s.replace(`role="${role}"`, `role="${role}" aria-label="[label]"`),
        user_impact: 'Users cannot identify the purpose of this landmark.' }, s);
    }
  });

  return { violations, snippets };
}

// ─── Scorer ───────────────────────────────────────────────────────────────────
const DEDUCTIONS = { Critical: 10, Serious: 5, Moderate: 2, Minor: 1 };

function computeScore(violations) {
  const score = Math.max(0, violations.reduce((acc, v) => acc - (DEDUCTIONS[v.severity] || 0), 100));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  return { score, grade };
}

// ─── Groq ─────────────────────────────────────────────────────────────────────
async function runGroqAudit(url, snippets, preliminary, apiKey) {
  const prompt = `You are an expert WCAG 2.1 accessibility auditor. A rule-based scanner found these violations on ${url}:

${JSON.stringify(preliminary.slice(0, 12), null, 2)}

HTML snippets:
${snippets.slice(0, 15).join('\n---\n')}

Include all above violations plus any additional ones you find. Return ONLY valid JSON — no markdown:
{
  "violations": [{"id":"string","category":"Images|Forms|Navigation|ARIA|Color|Keyboard|Headings|Buttons|Links|Language|Page Title","severity":"Critical|Serious|Moderate|Minor","wcag_rule":"WCAG X.X.X","description":"string","broken_code":"string","fixed_code":"string","user_impact":"string"}],
  "summary": "2-3 sentence overview",
  "top_fixes": ["fix 1", "fix 2", "fix 3"]
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama3-70b-8192', messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 4096 }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';

  try { return JSON.parse(raw); } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Invalid Groq response');
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
const SEV_COLOR = { Critical: '#DC2626', Serious: '#EA580C', Moderate: '#CA8A04', Minor: '#2563EB' };
const GRADE_COLOR = { A: '#16A34A', B: '#65A30D', C: '#CA8A04', D: '#EA580C', F: '#DC2626' };
const STEPS_LABELS = ['Connecting to tab', 'Reading page HTML', 'Running WCAG checks', 'AI analysis', 'Done'];

function renderSteps(active) {
  const list = document.getElementById('steps-list');
  list.innerHTML = STEPS_LABELS.map((label, i) => {
    const state = i < active ? 'done' : i === active ? 'active' : '';
    const dot = i < active ? '✓' : '';
    return `<div class="step ${state}"><div class="step-dot">${dot}</div>${label}</div>`;
  }).join('');
}

function scoreColor(score) {
  if (score >= 90) return '#16A34A';
  if (score >= 75) return '#65A30D';
  if (score >= 60) return '#CA8A04';
  if (score >= 40) return '#EA580C';
  return '#DC2626';
}

function animateScore(target) {
  const arc = document.getElementById('score-arc');
  const val = document.getElementById('score-val');
  const circumference = 2 * Math.PI * 32; // r=32
  const color = scoreColor(target);
  arc.setAttribute('stroke', color);
  let cur = 0;
  const step = target / 40;
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    val.textContent = Math.floor(cur);
    arc.setAttribute('stroke-dashoffset', circumference - (cur / 100) * circumference);
    if (cur >= target) clearInterval(timer);
  }, 20);
}

function renderResults(url, violations, score, grade) {
  document.getElementById('store-url').textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  document.getElementById('total-count').textContent = violations.length;
  document.getElementById('critical-count').textContent = violations.filter(v => v.severity === 'Critical').length;

  const badge = document.getElementById('grade-badge');
  const gc = GRADE_COLOR[grade] || '#DC2626';
  badge.textContent = grade;
  badge.style.background = gc + '22';
  badge.style.color = gc;
  badge.style.border = `1px solid ${gc}44`;

  animateScore(score);

  // Top 6 violations sorted by severity
  const order = ['Critical', 'Serious', 'Moderate', 'Minor'];
  const sorted = [...violations].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity)).slice(0, 6);

  document.getElementById('violations-list').innerHTML = sorted.map(v => `
    <div class="violation-item">
      <div class="sev-dot" style="background:${SEV_COLOR[v.severity] || '#6b7280'}"></div>
      <div class="violation-text">
        <div class="violation-cat" style="color:${SEV_COLOR[v.severity]}">${v.severity} · ${v.category}</div>
        <div class="violation-desc">${v.description}</div>
      </div>
    </div>
  `).join('');

}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function init() {
  const { groqApiKey } = await chrome.storage.local.get('groqApiKey');
  if (!groqApiKey) { show('setup'); return; }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url || '';
  document.getElementById('store-url').textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  show('scanning');
  renderSteps(0);

  try {
    renderSteps(1);
    const [{ result: html }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    });

    renderSteps(2);
    const { violations: preliminary, snippets } = extractViolations(html);

    renderSteps(3);
    let violations = preliminary;
    try {
      const groqResult = await runGroqAudit(url, snippets, preliminary, groqApiKey);
      if (Array.isArray(groqResult.violations) && groqResult.violations.length > 0) {
        violations = groqResult.violations;
      }
    } catch { /* use rule-based results */ }

    renderSteps(4);
    const { score, grade } = computeScore(violations);

    await new Promise(r => setTimeout(r, 400));
    show('results');
    renderResults(url, violations, score, grade);
    document.getElementById('open-report').onclick = () => {
      chrome.tabs.create({ url: `http://localhost:5173?url=${encodeURIComponent(url)}` });
    };

  } catch (err) {
    document.getElementById('error-msg').textContent = err.message || 'Scan failed. Make sure you are on a web page.';
    show('error');
  }
}

// ─── Event listeners ──────────────────────────────────────────────────────────
document.getElementById('save-key').addEventListener('click', async () => {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key) return;
  await chrome.storage.local.set({ groqApiKey: key });
  init();
});

document.getElementById('api-key-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('save-key').click();
});

document.getElementById('err-back').addEventListener('click', () => show('setup'));

init();
