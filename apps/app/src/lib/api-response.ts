export async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return await readJson<T>(response);
  } catch {
    return null;
  }
}
