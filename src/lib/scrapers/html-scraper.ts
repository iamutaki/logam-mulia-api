import * as cheerio from 'cheerio';
import { JINA_BASE_URL } from './jina-scraper';
import type { ApiResponse } from '../types/api.types';
import type { HtmlScraperConfig } from '../types/config.types';
import type {
	FetchOptions,
	ScraperItem,
	TransformFn,
	RawValue,
} from '../types/scraper.types';

export class HtmlScraper<T extends Record<string, string> = Record<string, string>> {
	private config: HtmlScraperConfig<string>;
	private source: string;

	constructor(source: string, config: HtmlScraperConfig<string>) {
		this.source = source;
		this.config = config;
	}

	private isRawValue(value: unknown): value is RawValue {
		return typeof value === 'object' && value !== null && '__raw' in value;
	}

	private async fetchHtml(url: string, options?: FetchOptions): Promise<cheerio.CheerioAPI> {
		const maxAttempts = (options?.retries ?? 0) + 1;
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 10000);

			try {
				// Akamai-protected sources (config.proxy='jina') fetch via Jina Reader to bypass
				// the 403 Cloudflare Worker egress IPs / TLS fingerprints get from Akamai Bot Manager.
				const targetUrl = this.config.proxy === 'jina' ? `${JINA_BASE_URL}${url}` : url;
				const response = await fetch(targetUrl, {
					signal: controller.signal,
					headers: options?.headers,
				});

				if (!response.ok) {
					let body = '';
					try { body = await response.text(); } catch { /* ignore */ }
					const bodySnippet = body.slice(0, 180).replace(/\s+/g, ' ').trim();
					const errorMessage = bodySnippet
						? `HTTP ${response.status}: ${response.statusText} - ${bodySnippet}`
						: `HTTP ${response.status}: ${response.statusText}`;

					// Retry on transient server/network-side failures and rate limits.
					if ((response.status >= 500 || response.status === 429) && attempt < maxAttempts) {
						lastError = new Error(errorMessage);
						if (response.status === 429) {
							await new Promise((r) => setTimeout(r, 3000));
						}
						continue;
					}

					throw new Error(errorMessage);
				}

				const html = await response.text();
				return cheerio.load(html);
			} catch (error) {
				lastError = error instanceof Error ? error : new Error('Unknown fetch error');
				if (attempt < maxAttempts) {
					continue;
				}
				throw lastError;
			} finally {
				clearTimeout(timeoutId);
			}
		}

		throw lastError ?? new Error('Unknown fetch error');
	}

	private extractFromDom(
		$: cheerio.CheerioAPI,
		selector: Record<string, string | RawValue>
	): Record<string, string> {
		const rawData: Record<string, string> = {};

		for (const [key, selValue] of Object.entries(selector)) {
			if (this.isRawValue(selValue)) {
				rawData[key] = String(selValue.__raw);
			} else if (typeof selValue === 'string' && selValue.startsWith('html:')) {
				const sel = selValue.slice('html:'.length);
				rawData[key] = ($(sel).html() ?? '').trim();
			} else if (typeof selValue === 'string' && selValue.startsWith('@')) {
				const idx = selValue.indexOf('|');
				const attr = selValue.slice(1, idx);
				const sel = selValue.slice(idx + 1);
				rawData[key] = ($(sel).attr(attr) ?? '').trim();
			} else {
				rawData[key] = $(selValue).text().trim();
			}
		}

		return rawData;
	}

	async scrape<TOutput = T>(
		transformer?: (data: Record<string, string>) => TOutput,
		options?: FetchOptions
	): Promise<ApiResponse<TOutput>> {
		const timestamp = new Date().toISOString();

		// Check if scraper is inactive
		if (this.config.active === false) {
			return {
				success: false,
				error: 'inactive',
				timestamp,
				source: this.source,
				currency: this.config.currency,
				inactive: true,
			};
		}

		// Build selector items: from items[] or from top-level selector
		const selectorItems = this.config.items ?? (this.config.selector
			? [{ selector: this.config.selector as Record<string, string | RawValue>, postProcess: this.config.postProcess }]
			: []);

		if (selectorItems.length === 0) {
			return {
				success: false,
				error: 'No selector or items defined in config.',
				timestamp,
				source: this.source,
				currency: this.config.currency,
			};
		}

		const items: TOutput[] = [];
		const errors: string[] = [];

		const itemsByUrl = new Map<string, typeof selectorItems>();
		for (const itemDef of selectorItems) {
			const targetUrl = itemDef.url ?? this.config.url;
			if (!targetUrl) {
				errors.push('missing item url and config.url');
				continue;
			}
			const existing = itemsByUrl.get(targetUrl) ?? [];
			existing.push(itemDef);
			itemsByUrl.set(targetUrl, existing);
		}

		for (const [targetUrl, defs] of itemsByUrl.entries()) {
			try {
				const $ = await this.fetchHtml(targetUrl, options);
				for (const def of defs) {
					const rawData = this.extractFromDom($, def.selector);
					const processedData = def.postProcess ? def.postProcess(rawData) : rawData;
					if (def.lineKey !== undefined) {
						processedData.lineKey = def.lineKey;
					}
					// Backward compatibility for existing transformers/tests.
					if (processedData.sell === undefined && processedData.buybackPrice !== undefined) {
						processedData.sell = processedData.buybackPrice;
					}
					if (processedData.buy === undefined && processedData.sellPrice !== undefined) {
						processedData.buy = processedData.sellPrice;
					}
					const transformed = transformer
						? transformer(processedData)
						: ((processedData as unknown) as TOutput);
					items.push(transformed);
				}
			} catch (error) {
				const errMsg = error instanceof Error ? error.message : 'Unknown error';
				errors.push(`${targetUrl}: ${errMsg}`);
			}
		}

		// If all items failed, return error
		if (items.length === 0 && errors.length > 0) {
			return {
				success: false,
				error: `All items failed: ${errors.join('; ')}`,
				timestamp,
				source: this.source,
				currency: this.config.currency,
			};
		}

		// Single item without items[] — return as object, not array
		if (!this.config.items && items.length === 1) {
			return {
				success: true,
				data: items[0],
				count: undefined,
				timestamp,
				source: this.source,
				currency: this.config.currency,
			};
		}

		return {
			success: true,
			data: items,
			count: items.length,
			timestamp,
			source: this.source,
			currency: this.config.currency,
		};
	}
}

/** @deprecated Use HtmlScraper */ export const CheerioScraper = HtmlScraper;
