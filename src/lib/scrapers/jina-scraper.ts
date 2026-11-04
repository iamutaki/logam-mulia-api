import type { ScrapingOptions } from '../types/scraper.types';

const JINA_BASE_URL = 'https://r.jina.ai/';

/** Status codes that mean "try the next API key". */
function shouldRotateApiKey(status: number): boolean {
	return status === 401 || status === 402 || status === 403;
}

/**
 * Resolve Jina key pool from env.
 * Prefer `JINA_API_KEYS` (comma/newline-separated); fall back to single `JINA_API_KEY`.
 */
export function resolveJinaApiKeys(env: {
	JINA_API_KEY?: string;
	JINA_API_KEYS?: string;
}): string[] {
	const fromList = (env.JINA_API_KEYS ?? '')
		.split(/[,\n]/)
		.map((s) => s.trim())
		.filter(Boolean);

	if (fromList.length > 0) {
		return [...new Set(fromList)];
	}

	const single = env.JINA_API_KEY?.trim();
	return single ? [single] : [];
}

export class JinaScraper {
	private apiKeys: string[];

	constructor(apiKeys?: string | string[]) {
		if (Array.isArray(apiKeys)) {
			this.apiKeys = [...new Set(apiKeys.map((k) => k.trim()).filter(Boolean))];
		} else if (typeof apiKeys === 'string' && apiKeys.trim()) {
			// Single string may still be a comma-separated list
			this.apiKeys = resolveJinaApiKeys({ JINA_API_KEYS: apiKeys });
		} else {
			this.apiKeys = [];
		}
	}

	private buildProxyUrl(targetUrl: string): string {
		return `${JINA_BASE_URL}${targetUrl}`;
	}

	async fetch(targetUrl: string, options?: ScrapingOptions): Promise<{ text: string; timestamp: string }> {
		const proxyUrl = this.buildProxyUrl(targetUrl);
		const maxAttempts = (options?.retries ?? 1) + 1;
		// Trailing `undefined` = last-resort anonymous attempt (Jina free tier, ~20 RPM).
		const keyPool = this.apiKeys.length > 0 ? [...this.apiKeys, undefined] : [undefined];
		let lastError: Error | null = null;

		for (let keyIndex = 0; keyIndex < keyPool.length; keyIndex++) {
			const apiKey = keyPool[keyIndex];

			for (let attempt = 1; attempt <= maxAttempts; attempt++) {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 15000);

				try {
					const headers: Record<string, string> = {
						Accept: 'text/markdown',
						...(options?.headers ?? {}),
					};
					// Strip Accept-Encoding — Jina returns binary gzip if client advertises it, but without a proper Content-Encoding header, so the runtime can't auto-decompress.
					// Without Accept-Encoding, Jina returns plain text with Content-Encoding absent → Workers runtime reads it as-is = correct markdown.
					delete headers['Accept-Encoding'];
					delete headers['accept-encoding'];

					if (apiKey) {
						headers['Authorization'] = `Bearer ${apiKey}`;
					}

					const response = await fetch(proxyUrl, {
						signal: controller.signal,
						headers,
					});

					if (!response.ok) {
						let body = '';
						try {
							body = await response.text();
						} catch {
							/* ignore */
						}
						const bodySnippet = body.slice(0, 180).replace(/\s+/g, ' ').trim();
						const errorMessage = bodySnippet
							? `HTTP ${response.status}: ${response.statusText} - ${bodySnippet}`
							: `HTTP ${response.status}: ${response.statusText}`;

						lastError = new Error(errorMessage);

						// Exhausted / unauthorized key → try next key (no same-key retry)
						if (shouldRotateApiKey(response.status) && keyIndex < keyPool.length - 1) {
							break;
						}

						// Retry on 429 (rate limit) and 5xx (server errors) with same key
						if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
							const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
							await new Promise((resolve) => setTimeout(resolve, backoffMs));
							continue;
						}

						throw lastError;
					}

					const text = await response.text();
					return { text, timestamp: new Date().toISOString() };
				} catch (error) {
					lastError = error instanceof Error ? error : new Error('Unknown fetch error');
					if (attempt < maxAttempts) {
						continue;
					}
					// Network/abort after retries: try next key if any
					if (keyIndex < keyPool.length - 1) {
						break;
					}
					throw lastError;
				} finally {
					clearTimeout(timeoutId);
				}
			}
		}

		throw lastError ?? new Error('Unknown fetch error');
	}
}
