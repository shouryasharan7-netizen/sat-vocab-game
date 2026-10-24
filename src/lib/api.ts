// Cloud save and load helpers for cross-device sync

export type CloudState = Record<string, unknown>;

export async function saveToCloud(uid: string, state: CloudState): Promise<boolean> {
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadFromCloud(uid: string): Promise<CloudState | null> {
  try {
    const res = await fetch(`/api/save?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) return null;
    const { data } = await res.json();
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }
}
