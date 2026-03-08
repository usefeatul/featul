const TWITTER_HOSTS = new Set([
	"x.com",
	"www.x.com",
	"twitter.com",
	"www.twitter.com",
]);

function withProtocol(url: string): string {
	return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function normalizeTwitterUrl(url: string): string | null {
	const raw = url.trim();
	if (!raw) {
		return null;
	}

	let parsed: URL;
	try {
		parsed = new URL(withProtocol(raw));
	} catch {
		return null;
	}

	if (!TWITTER_HOSTS.has(parsed.hostname.toLowerCase())) {
		return null;
	}

	const segments = parsed.pathname.split("/").filter(Boolean);
	const statusIndex = segments.findIndex(
		(segment) => segment.toLowerCase() === "status",
	);

	if (statusIndex < 0 || statusIndex >= segments.length - 1) {
		return null;
	}

	const tweetId = segments[statusIndex + 1];
	if (!tweetId || !/^\d+$/.test(tweetId)) {
		return null;
	}

	const usernameCandidate = statusIndex > 0 ? segments[statusIndex - 1] : null;
	const isValidUsername =
		!!usernameCandidate && /^[a-zA-Z0-9_]{1,15}$/.test(usernameCandidate);

	if (isValidUsername) {
		return `https://x.com/${usernameCandidate}/status/${tweetId}`;
	}

	// Covers links such as https://x.com/i/web/status/<id>
	return `https://x.com/i/web/status/${tweetId}`;
}

export function isValidTwitterUrl(url: string): boolean {
	return normalizeTwitterUrl(url) !== null;
}

export function extractTweetId(url: string): string | null {
	const normalized = normalizeTwitterUrl(url);
	if (!normalized) {
		return null;
	}

	const match = normalized.match(/\/status\/(\d+)$/);
	return match?.[1] ?? null;
}

export const TWITTER_URL_GLOBAL_REGEX =
	/https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(?:[a-zA-Z0-9_]{1,15}|i\/web)\/status\/\d+(?:[/?#][^\s]*)?/gi;
