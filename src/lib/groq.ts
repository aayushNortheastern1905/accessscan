import Groq from 'groq';
import type { AuditResult, Violation } from '../types';

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

export async function runGroqAudit(
  url: string,
  snippets: string[],
  preliminary: Violation[],
): Promise<AuditResult> {
  const prompt = `You are an expert WCAG 2.1 accessibility auditor. A rule-based scanner already found the following violations on the Shopify store at ${url}:

${JSON.stringify(preliminary.slice(0, 15), null, 2)}

HTML snippets from the page:
${snippets.slice(0, 20).join('\n---\n')}

Your job:
1. Include all the violations above (keep their structure)
2. Add any additional violations you detect from the snippets
3. Improve descriptions and fixed_code where you can

Return ONLY a JSON object — no markdown, no prose — matching this exact schema:
{
  "violations": [
    {
      "id": "string",
      "category": "Images|Forms|Navigation|ARIA|Color|Keyboard|Headings|Buttons|Links|Language|Page Title",
      "severity": "Critical|Serious|Moderate|Minor",
      "wcag_rule": "WCAG X.X.X",
      "description": "plain English explanation",
      "broken_code": "the problematic HTML",
      "fixed_code": "corrected HTML",
      "user_impact": "who is affected and how"
    }
  ],
  "score": 0,
  "grade": "A|B|C|D|F",
  "summary": "2-3 sentence plain English overview of this store's accessibility state",
  "top_fixes": ["priority fix 1", "fix 2", "fix 3"]
}`;

  const completion = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content ?? '';

  let parsed: Omit<AuditResult, 'url' | 'scannedAt'>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Groq returned unparseable response');
    parsed = JSON.parse(match[0]);
  }

  return { ...parsed, url, scannedAt: new Date().toISOString() };
}
