export function randomAvatarUrl(seed?: string | null, style: 'identicon' | 'avataaars' = 'identicon') {
  const s = encodeURIComponent((seed || 'anonymous').trim() || 'anonymous')
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${s}`
}
