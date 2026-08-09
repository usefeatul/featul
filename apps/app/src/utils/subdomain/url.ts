type SearchParamsLike = {
  forEach: (callback: (value: string, key: string) => void) => void
}

export function buildUrlWithSearchParam(
  pathname: string,
  searchParams: SearchParamsLike,
  nextSearch: string,
): string {
  const url = new URL(pathname || "/", "http://dummy")
  searchParams.forEach((value, key) => {
    if (key !== "search") url.searchParams.set(key, value)
  })

  const trimmed = nextSearch.trim()
  if (trimmed) {
    url.searchParams.set("search", trimmed)
  } else {
    url.searchParams.delete("search")
  }

  const query = url.searchParams.toString()
  return `${url.pathname}${query ? `?${query}` : ""}`
}
