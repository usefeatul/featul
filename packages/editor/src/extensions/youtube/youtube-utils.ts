function withProtocol(url: string): string {
	return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function extractFromPath(pathname: string, prefix: string): string | null {
	const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
	if (!normalizedPath.startsWith(prefix)) {
		return null;
	}

	const value = normalizedPath.slice(prefix.length).split("/")[0];
	return value || null;
}

export function extractYouTubeVideoId(url: string): string | null {
	const raw = url.trim();
	if (!raw) {
		return null;
	}

	if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
		return raw;
	}

	let parsed: URL;
	try {
		parsed = new URL(withProtocol(raw));
	} catch {
		return null;
	}

	const hostname = parsed.hostname.toLowerCase();
	let candidate: string | null = null;

	if (hostname === "youtu.be" || hostname === "www.youtu.be") {
		candidate = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
	} else if (
		hostname === "youtube.com" ||
		hostname === "www.youtube.com" ||
		hostname === "m.youtube.com"
	) {
		candidate =
			parsed.searchParams.get("v") ||
			extractFromPath(parsed.pathname, "/embed/") ||
			extractFromPath(parsed.pathname, "/shorts/") ||
			extractFromPath(parsed.pathname, "/live/");
	}

	return candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
}

export function normalizeYouTubeUrl(url: string): string | null {
	const videoId = extractYouTubeVideoId(url);
	return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

export function isValidYouTubeUrl(url: string): boolean {
	return extractYouTubeVideoId(url) !== null;
}
