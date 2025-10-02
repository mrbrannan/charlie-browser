import type { InterviewData } from './types';

// Raw JSON from the gist in TEL-101. We intentionally omit the revision so
// updates to the gist are picked up automatically.
export const GIST_RAW_URL =
  process.env.NEXT_PUBLIC_CHARLIE_GIST_RAW_URL ??
  'https://gist.githubusercontent.com/rileytomasek/0ca22aaf6df4985befd6779e37dab1a2/raw/data.json';

export const CURRENT_SCHEMA_VERSION = 1 as const;

export async function fetchInterviewData(signal?: AbortSignal): Promise<InterviewData> {
  const res = await fetch(GIST_RAW_URL, {
    method: 'GET',
    // Revalidate with ETag/Last‑Modified while avoiding stale caches
    cache: 'no-cache',
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data.json (${res.status} ${res.statusText})`);
  }

  const data = (await res.json()) as InterviewData;
  if (typeof data.schemaVersion !== 'number') {
    throw new Error('Invalid data: missing schemaVersion');
  }
  if (data.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error(`Unexpected schemaVersion: ${data.schemaVersion}`);
  }
  return data;
}
