/** DiceBear SVG URL for `seed`. Empty seed becomes `"anonymous"`. */
export function randomAvatarUrl(seed?: string | null, style: 'avataaars' | 'identicon' | 'bottts' = 'avataaars') {
  const s = encodeURIComponent((seed || 'anonymous').trim() || 'anonymous')
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${s}`
}
