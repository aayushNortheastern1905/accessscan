import type { Violation, Category, Severity } from '../types';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function violation(
  category: Category,
  severity: Severity,
  wcag_rule: string,
  description: string,
  broken_code: string,
  fixed_code: string,
  user_impact: string,
): Violation {
  return { id: uid(), category, severity, wcag_rule, description, broken_code, fixed_code, user_impact };
}

export function extractViolations(html: string): { violations: Violation[]; snippets: string[] } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const violations: Violation[] = [];
  const snippets: string[] = [];

  function add(v: Violation, snippet: string) {
    violations.push(v);
    snippets.push(snippet.slice(0, 300));
  }

  // 1. Images missing alt
  doc.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('alt')) {
      const s = img.outerHTML.slice(0, 300);
      add(
        violation(
          'Images', 'Critical', 'WCAG 1.1.1',
          'Image is missing an alt attribute.',
          s,
          s.replace('<img', '<img alt="[describe the image]"'),
          'Screen reader users hear nothing — they have no idea what this image shows.',
        ),
        s,
      );
    }
  });

  // 2. Inputs with no label
  doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])').forEach((el) => {
    const input = el as HTMLInputElement;
    const id = input.getAttribute('id');
    const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
    const hasAria = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
    if (!hasLabel && !hasAria) {
      const s = input.outerHTML.slice(0, 300);
      add(
        violation(
          'Forms', 'Critical', 'WCAG 1.3.1',
          'Form input has no associated label.',
          s,
          `<label for="field-id">Field name</label>\n${s.replace('<input', '<input id="field-id"')}`,
          'Screen reader users cannot tell what information to enter in this field.',
        ),
        s,
      );
    }
  });

  // 3. Buttons with no accessible name
  doc.querySelectorAll('button').forEach((btn) => {
    const text = btn.textContent?.trim();
    const ariaLabel = btn.getAttribute('aria-label');
    const ariaLabelledby = btn.getAttribute('aria-labelledby');
    if (!text && !ariaLabel && !ariaLabelledby) {
      const s = btn.outerHTML.slice(0, 300);
      add(
        violation(
          'Buttons', 'Critical', 'WCAG 4.1.2',
          'Button has no accessible name.',
          s,
          s.replace('<button', '<button aria-label="[describe action]"'),
          'Keyboard and screen reader users cannot determine what this button does.',
        ),
        s,
      );
    }
  });

  // 4. Vague link text
  const vagueTerms = new Set(['click here', 'read more', 'learn more', 'here', 'more', 'link', 'this']);
  doc.querySelectorAll('a').forEach((a) => {
    const text = a.textContent?.trim().toLowerCase() ?? '';
    if (vagueTerms.has(text)) {
      const s = a.outerHTML.slice(0, 300);
      add(
        violation(
          'Links', 'Serious', 'WCAG 2.4.4',
          `Link text "${a.textContent?.trim()}" does not describe its destination.`,
          s,
          s.replace(a.textContent?.trim() ?? '', '[Descriptive link text]'),
          'Screen reader users navigating by links cannot predict where this link goes.',
        ),
        s,
      );
    }
  });

  // 5. Missing lang attribute on <html>
  const htmlEl = doc.querySelector('html');
  if (!htmlEl?.getAttribute('lang')) {
    add(
      violation(
        'Language', 'Serious', 'WCAG 3.1.1',
        'The <html> element is missing a lang attribute.',
        '<html>',
        '<html lang="en">',
        'Screen readers cannot select the correct language engine for pronunciation.',
      ),
      '<html>',
    );
  }

  // 6. Broken heading hierarchy
  const headings = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  let prevLevel = 0;
  headings.forEach((h) => {
    const level = parseInt(h.tagName[1]);
    if (prevLevel && level > prevLevel + 1) {
      const s = h.outerHTML.slice(0, 300);
      add(
        violation(
          'Headings', 'Moderate', 'WCAG 1.3.1',
          `Heading skips from h${prevLevel} to h${level} — levels ${prevLevel + 1} through ${level - 1} are missing.`,
          s,
          s.replace(new RegExp(`h${level}`, 'g'), `h${prevLevel + 1}`),
          'Screen reader users navigating by heading will encounter a confusing document structure.',
        ),
        s,
      );
    }
    prevLevel = level;
  });

  // 7. No skip navigation link
  const firstLink = doc.querySelector('a');
  const hasSkip =
    firstLink?.getAttribute('href')?.startsWith('#') &&
    (firstLink.textContent?.toLowerCase().includes('skip') || firstLink.textContent?.toLowerCase().includes('main'));
  if (!hasSkip) {
    add(
      violation(
        'Navigation', 'Moderate', 'WCAG 2.4.1',
        'No skip navigation link detected.',
        '<!-- no skip link present -->',
        '<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>',
        'Keyboard users must tab through every nav item on every page load.',
      ),
      '<!-- no skip link -->',
    );
  }

  // 8. Missing or empty page title
  const title = doc.querySelector('title');
  if (!title || !title.textContent?.trim()) {
    add(
      violation(
        'Page Title', 'Moderate', 'WCAG 2.4.2',
        'Page is missing a <title> element.',
        '<!-- no <title> in <head> -->',
        '<title>Store Name — Page Description</title>',
        'Screen reader users cannot identify the page from their browser tab or history list.',
      ),
      '<!-- no title -->',
    );
  }

  // 9. ARIA landmarks missing accessible name
  const landmarkRoles = new Set(['dialog', 'alertdialog', 'navigation', 'region', 'form', 'search']);
  doc.querySelectorAll('[role]').forEach((el) => {
    const role = el.getAttribute('role') ?? '';
    if (
      landmarkRoles.has(role) &&
      !el.getAttribute('aria-label') &&
      !el.getAttribute('aria-labelledby')
    ) {
      const s = el.outerHTML.slice(0, 300);
      add(
        violation(
          'ARIA', 'Serious', 'WCAG 4.1.2',
          `Element with role="${role}" has no accessible name.`,
          s,
          s.replace(`role="${role}"`, `role="${role}" aria-label="[Descriptive label]"`),
          'Assistive technology users cannot distinguish this landmark from others of the same type.',
        ),
        s,
      );
    }
  });

  return { violations, snippets };
}
