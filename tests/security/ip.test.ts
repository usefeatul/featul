import { expect, test } from 'bun:test';
import { trustedIpHeaders } from '../../packages/auth/src/ip';

test('Vercel never trusts spoofable Cloudflare or Fly headers', () => {
  expect(trustedIpHeaders({VERCEL:'1',NODE_ENV:'production',TRUSTED_PROXY_IP_HEADER:'cf-connecting-ip'})).toEqual(['x-vercel-forwarded-for','x-forwarded-for']);
});
test('other production hosts require an explicit ingress header', () => {
  expect(trustedIpHeaders({NODE_ENV:'production'})).toEqual([]);
  expect(trustedIpHeaders({NODE_ENV:'production',TRUSTED_PROXY_IP_HEADER:'cf-connecting-ip'})).toEqual(['cf-connecting-ip']);
});
test('arbitrary headers cannot become rate-limit identities', () => {
  expect(trustedIpHeaders({NODE_ENV:'production',TRUSTED_PROXY_IP_HEADER:'user-agent'})).toEqual([]);
});
