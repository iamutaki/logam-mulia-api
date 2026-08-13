import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('CORS middleware', () => {
	it('attaches Access-Control-Allow-Origin to normal GET responses', async () => {
		const res = await app.request('/');

		expect(res.status).toBe(200);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it('responds to OPTIONS preflight with 204 and the configured headers', async () => {
		const res = await app.request('/api/prices/logammulia', {
			method: 'OPTIONS',
			headers: {
				Origin: 'https://example.com',
				'Access-Control-Request-Method': 'GET',
				'Access-Control-Request-Headers': 'content-type',
			},
		});

		expect(res.status).toBe(204);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET,OPTIONS');
		expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
		expect(res.headers.get('Access-Control-Max-Age')).toBe('86400');
	});

	// ponytail: preflight must not 404 even for unknown paths — cors runs before routing
	it('returns 204 for preflight on an unknown route', async () => {
		const res = await app.request('/api/prices/does-not-exist', {
			method: 'OPTIONS',
			headers: {
				Origin: 'https://example.com',
				'Access-Control-Request-Method': 'GET',
			},
		});

		expect(res.status).toBe(204);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});
