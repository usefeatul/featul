/** Resolve the entire selection before changing any editor state. */
export function resolveTagSelection(
  names: string[],
  available: Array<{ id: string; name: string }>,
) {
  const byName = new Map(
    available.map((tag) => [tag.name.trim().toLowerCase(), tag.id]),
  );
  return [
    ...new Set(
      names.map((name) => {
        const id = byName.get(name.trim().toLowerCase());
        if (!id)
          throw new Error(
            "The available tags changed while I was responding. Please try again.",
          );
        return id;
      }),
    ),
  ];
}
