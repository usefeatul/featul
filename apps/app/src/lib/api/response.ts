type JsonReadable = {
  json(): Promise<unknown>;
};

export async function readJson<T>(response: JsonReadable): Promise<T> {
  return (await response.json()) as T;
}

/** Parses JSON, returning null instead of throwing. */
export async function safeJson<T>(response: JsonReadable): Promise<T | null> {
  try {
    return await readJson<T>(response);
  } catch {
    return null;
  }
}
