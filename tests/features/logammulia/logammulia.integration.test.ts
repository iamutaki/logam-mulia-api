import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../../src/features/api/prices/logammulia/route';

global.fetch = vi.fn();

describe('LogamMulia Integration Tests', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const mockJinaOutput = `Title: Harga Emas Hari Ini | Logam Mulia

URL Source: https://www.logammulia.com/harga-emas-hari-ini

Markdown Content:
[](https://www.logammulia.com/harga-emas-hari-ini)

Hello!

## Harga Emas Hari Ini, 30 Jun 2026

Harga di-update setiap hari pkl. 08.30 WIB

| Berat | Harga Dasar | Harga (+Pajak PPh 0.25%) |
| --- | --- | --- |
| Emas Batangan |
| 0.5 gr | 1,365,000 | 1,368,413 |
| 1 gr | 2,630,000 | 2,636,575 |
| 5 gr | 12,925,000 | 12,957,313 |
| 25 gr | 64,362,000 | 64,522,905 |
| 100 gr | 257,212,000 | 257,855,030 |
| Emas Batangan Gift Series |
| 0.5 gr | 1,435,000 | 1,438,594 |
| Emas Batangan Selamat Idul Fitri |
| 5 gr | 13,898,000 | 13,932,745 |
| Perak Murni |
| 250 gr | 10,225,000 | 10,250,563 |
| Perak Heritage |
| 31.1 gr | 1,770,005 | 1,774,430 |
`;

	it('returns 23 prices from mocked Jina fetch', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			text: async () => mockJinaOutput,
		} as Response);

		const res = await app.request('/?refresh=true', undefined, {
			JINA_API_KEY: 'test-key',
			TURSO_DATABASE_URL: undefined,
			TURSO_AUTH_TOKEN: undefined,
		});
		const result = await res.json();

		expect(result.success).toBe(true);
		expect(result.data).toHaveLength(9);
		expect(result.cached).toBe(false);
	});

	it('returns correct first price item structure', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			text: async () => mockJinaOutput,
		} as Response);

		const res = await app.request('/', undefined, {
			JINA_API_KEY: 'test-key',
			TURSO_DATABASE_URL: undefined,
			TURSO_AUTH_TOKEN: undefined,
		});
		const result = await res.json();
		const item = result.data[0];

		expect(item.material).toBe('gold');
		expect(item.materialType).toBe('Emas Batangan');
		expect(item.weight).toBe(0.5);
		expect(item.weightUnit).toBe('gr');
		expect(item.sellPrice).toBe(1365000);
		expect(item.buybackPrice).toBeNull();
	});

	it('handles fetch failure gracefully', async () => {
		// JinaScraper retries 3 times (retries=2 + 1), so mock must keep rejecting
		vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

		const res = await app.request('/', undefined, {
			JINA_API_KEY: 'test-key',
			TURSO_DATABASE_URL: undefined,
			TURSO_AUTH_TOKEN: undefined,
		});
		const result = await res.json();

		expect(result.success).toBe(false);
		expect(result.error).toContain('Network error');
	});

	it('handles Jina HTTP error', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: false,
			status: 429,
			statusText: 'Too Many Requests',
			text: async () => 'Rate limited',
		} as Response);

		const res = await app.request('/', undefined, {
			JINA_API_KEY: 'test-key',
			TURSO_DATABASE_URL: undefined,
			TURSO_AUTH_TOKEN: undefined,
		});
		const result = await res.json();

		expect(result.success).toBe(false);
	});
});
