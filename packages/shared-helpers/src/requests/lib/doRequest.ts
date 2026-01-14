interface IdoRequest {
  url: string;
  authToken?: string;
  signal?: AbortSignal;
}
export async function doRequest<T extends unknown>({ url, authToken, signal }: IdoRequest): Promise<T> {
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Basic ${authToken}`);
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}
