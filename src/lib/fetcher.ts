const PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&callback=`,
];

async function tryProxy(proxyUrl: string): Promise<string> {
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (!data.contents || data.contents.length < 500) throw new Error('Empty response from proxy');
  return data.contents as string;
}

export async function fetchHTML(url: string): Promise<string> {
  for (const makeProxy of PROXIES) {
    try {
      return await tryProxy(makeProxy(url));
    } catch {
      // try next proxy
    }
  }

  throw new Error(
    `Could not fetch "${url}". The store may be blocking external scanners, or the URL is incorrect. Try one of the demo stores to confirm the tool is working.`
  );
}
