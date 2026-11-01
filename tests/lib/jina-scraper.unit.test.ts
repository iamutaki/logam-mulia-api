import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JinaScraper, resolveJinaApiKeys } from '../../src/lib/scrapers/jina-scraper';

global.fetch = vi.fn();

describe('resolveJinaApiKeys', () => {
	it('parses comma-separated JINA_API_KEYS and dedupes', () => {
		expect(
			resolveJinaApiKeys({ JINA_API_KEYS: ' a , b, a ', JINA_API_KEY: 'ignored' }),
		).toEqual(['a', 'b']);
	});

	it('parses newline-separated JINA_API_KEYS', () => {
		expect(resolveJinaApiKeys({ JINA_API_KEYS: 'k1\nk2\n' })).toEqual(['k1', 'k2']);
	});

	it('falls back to JINA_API_KEY when list empty', () => {
		expect(resolveJinaApiKeys({ JINA_API_KEY: ' solo ' })).toEqual(['solo']);
	});

	it('returns empty when neither set', () => {
		expect(resolveJinaApiKeys({})).toEqual([]);
	});
});

describe('JinaScraper key pool failover', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('rotates to next key on HTTP 402', async () => {
		vi.mocked(global.fetch)
			.mockResolvedValueOnce({
				ok: false,
				status: 402,
				statusText: 'Payment Required',
				text: async () => '{"name":"InsufficientBalanceError"}',
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				statusText: 'OK',
				text: async () => '# ok markdown',
			} as Response);

		const scraper = new JinaScraper(['dead-key', 'live-key']);
		const result = await scraper.fetch('https://example.com', { retries: 0, timeout: 5000 });

		expect(result.text).toBe('# ok markdown');
		expect(global.fetch).toHaveBeenCalledTimes(2);

		const firstAuth = vi.mocked(global.fetch).mock.calls[0][1]?.headers as Record<string, string>;
		const secondAuth = vi.mocked(global.fetch).mock.calls[1][1]?.headers as Record<string, string>;
		expect(firstAuth.Authorization).toBe('Bearer dead-key');
		expect(secondAuth.Authorization).toBe('Bearer live-key');
	});

	it('throws last error when all keys return 402', async () => {
		vi.mocked(global.fetch).mockResolvedValue({
			ok: false,
			status: 402,
			statusText: 'Payment Required',
			text: async () => '{"name":"InsufficientBalanceError"}',
		} as Response);

		const scraper = new JinaScraper(['k1', 'k2']);
		await expect(scraper.fetch('https://example.com', { retries: 0, timeout: 5000 })).rejects.toThrow(
			/402/,
		);
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});
});
