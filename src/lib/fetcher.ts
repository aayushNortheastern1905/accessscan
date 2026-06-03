// codetabs returns raw HTML directly; allorigins returns {"contents": "..."}
type ProxyConfig = { url: (u: string) => string; json: boolean };

const PROXIES: ProxyConfig[] = [
  {
    url: (u) => `https://api.codetabs.com/v1/proxy/?quest=${u}`,
    json: false,
  },
  {
    url: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    json: true,
  },
];

async function tryProxy(config: ProxyConfig, targetUrl: string): Promise<string> {
  const res = await fetch(config.url(targetUrl), { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`${res.status}`);

  if (config.json) {
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.contents || data.contents.length < 500) throw new Error('Empty response');
    return data.contents as string;
  }

  const text = await res.text();
  if (text.length < 500) throw new Error('Empty response');
  return text;
}

export async function fetchHTML(url: string): Promise<string> {
  for (const proxy of PROXIES) {
    try {
      return await tryProxy(proxy, url);
    } catch {
      // try next
    }
  }

  throw new Error(
    `Could not fetch this store. It may be blocking external scanners. Try one of the demo stores to confirm the tool is working.`,
  );
}
