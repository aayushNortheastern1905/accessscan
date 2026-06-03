export async function fetchHTML(url: string): Promise<string> {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
  const data = await res.json();
  if (!data.contents) throw new Error('No content returned — store may be blocking the proxy');
  return data.contents as string;
}
