import type { ScrapingOptions } from '../types/scraper.types';
import { parseCurrency } from '../utils/currency';
import { JinaScraper, resolveJinaApiKeys } from './jina-scraper';

export interface JinaMarkdownLabelRowConfig {
	/** Setara `materialType` di sumber Cheerio / `normalizePriceRows`. */
	materialType: string;
	material?: string;
	weight?: number;
	weightUnit?: string;
	/**
	 * Regex pada seluruh markdown; grup 1 = nominal mentah.
	 * Nominal → {@link JinaMarkdownLabelRowResult.buybackPrice}.
	 * Prioritas di atas {@link buybackPriceLabel} bila keduanya ada.
	 */
	buybackPriceRegex?: RegExp;
	/**
	 * Substring sebelum `Rp …` di markdown (case-insensitive, di-escape).
	 * Dipakai jika {@link buybackPriceRegex} tidak diisi.
	 */
	buybackPriceLabel?: string;
	/** Nominal → {@link JinaMarkdownLabelRowResult.sellPrice} (boleh dipakai untuk teks situs apa pun, termasuk label “beli”, sesuai keputusan domain per sumber). */
	sellPriceRegex?: RegExp;
	/** Jika diisi (tanpa sellPriceRegex), pakai pola label+R seperti buyback. */
	sellPriceLabel?: string;
}

export interface JinaMarkdownLabelPriceConfig {
	name: string;
	displayName?: string;
	logo?: string;
	urlHomepage?: string;
	url: string;
	currency: string;
	active: boolean;
	/** First capture group is appended to each row as `info`. */
	infoPattern?: RegExp;
	/** Daftar entri harga — setara `items` pada `CheerioScrapingConfig`. */
	items: JinaMarkdownLabelRowConfig[];
}

function escapeRegexLiteral(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Captures `Rp` amount after a fixed label (tolerates newlines / markdown bold before `Rp`). */
function extractRpAfterLabel(text: string, label: string): string | null {
	const escaped = escapeRegexLiteral(label);
	const regex = new RegExp(`${escaped}\\s*(?:\\n\\s*)?(?:\\*\\*)?Rp\\s*([\\d.,]+)`, 'i');
	const match = text.match(regex);
	return match?.[1]?.trim() ?? null;
}

function extractBuybackPriceRaw(markdown: string, row: JinaMarkdownLabelRowConfig): string | null {
	if (row.buybackPriceRegex) {
		return markdown.match(row.buybackPriceRegex)?.[1]?.trim() ?? null;
	}
	if (row.buybackPriceLabel) {
		return extractRpAfterLabel(markdown, row.buybackPriceLabel);
	}
	return null;
}

function extractSellPriceRaw(markdown: string, row: JinaMarkdownLabelRowConfig): string | null {
	if (row.sellPriceRegex) {
		return markdown.match(row.sellPriceRegex)?.[1]?.trim() ?? null;
	}
	if (row.sellPriceLabel) {
		return extractRpAfterLabel(markdown, row.sellPriceLabel);
	}
	return null;
}

/** Bentuk baris harga — nama field sama dengan {@link normalizePriceRows} / kolom DB (`sell_price`, `buyback_price`). */
export interface JinaMarkdownLabelRowResult {
	material: string;
	materialType: string;
	weight: number;
	weightUnit: string;
	sellPrice: number;
	buybackPrice: number | null;
	info: string;
}

/**
 * Membangun baris harga dari markdown Jina.
 * Per item: isi **salah satu atau dua** pasangan regex/label (`buyback*` dan/atau `sell*`).
 * Baris dibuang hanya jika **tidak ada** nominal yang terbaca dari sumber yang Anda konfigurasi.
 */
export function buildJinaMarkdownLabelRows(
	markdown: string,
	config: Pick<JinaMarkdownLabelPriceConfig, 'infoPattern' | 'items'>,
): JinaMarkdownLabelRowResult[] {
	const info = config.infoPattern ? (markdown.match(config.infoPattern)?.[1]?.trim() ?? '') : '';

	const out: JinaMarkdownLabelRowResult[] = [];
	for (const row of config.items) {
		const hasBuybackSource = !!(row.buybackPriceRegex ?? row.buybackPriceLabel);
		const hasSellSource = !!(row.sellPriceRegex ?? row.sellPriceLabel);
		if (!hasBuybackSource && !hasSellSource) {
			continue;
		}

		const buybackRaw = hasBuybackSource ? extractBuybackPriceRaw(markdown, row) : null;
		const sellRaw = hasSellSource ? extractSellPriceRaw(markdown, row) : null;
		if (!buybackRaw && !sellRaw) {
			continue;
		}

		const buybackParsed = buybackRaw ? parseCurrency(buybackRaw) : 0;
		const buybackPrice = buybackParsed > 0 ? buybackParsed : null;

		let sellPrice = 0;
		if (sellRaw) {
			const parsed = parseCurrency(sellRaw);
			sellPrice = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
		}

		out.push({
			material: row.material ?? 'gold',
			materialType: row.materialType,
			weight: row.weight ?? 1,
			weightUnit: row.weightUnit ?? 'gr',
			sellPrice,
			buybackPrice,
			info,
		});
	}
	return out;
}

export type JinaMarkdownLabelScrapeEnv = {
	JINA_API_KEY?: string;
	JINA_API_KEYS?: string;
};

export type JinaMarkdownLabelErrorBody = {
	success: false;
	error: string;
	timestamp: string;
	source: string;
	currency: string;
};

export type JinaMarkdownLabelSuccessBody = {
	success: true;
	data: JinaMarkdownLabelRowResult[];
	count: number;
	timestamp: string;
	source: string;
	currency: string;
};

export type JinaMarkdownLabelScrapeBody = JinaMarkdownLabelSuccessBody | JinaMarkdownLabelErrorBody;

export type JinaMarkdownLabelScrapeResult =
	| { ok: true; status: 200; body: JinaMarkdownLabelSuccessBody }
	| { ok: false; status: 400 | 500 | 502; body: JinaMarkdownLabelErrorBody };

/** Bentuk yang dipakai callback `fetchOrCache` (`price-service`). */
export type JinaMarkdownLabelFetchOrCacheScrapeResult = {
	success: boolean;
	data?: unknown;
	error?: string;
	timestamp: string;
	source: string;
	currency?: string;
	inactive?: boolean;
};

/**
 * Pipeline Jina + `buildJinaMarkdownLabelRows` untuk sembarang `JinaMarkdownLabelPriceConfig`
 * (mis. Brankas LM; sumber baru cukup definisikan config lalu panggil fungsi ini).
 */
export async function scrapeJinaMarkdownLabelPrices(
	env: JinaMarkdownLabelScrapeEnv,
	cfg: JinaMarkdownLabelPriceConfig,
	options?: ScrapingOptions,
): Promise<JinaMarkdownLabelScrapeResult> {
	const timestamp = new Date().toISOString();

	if (!cfg.active) {
		return {
			ok: false,
			status: 400,
			body: {
				success: false,
				error: 'inactive',
				timestamp,
				source: cfg.name,
				currency: cfg.currency,
			},
		};
	}

	try {
		const scraper = new JinaScraper(resolveJinaApiKeys(env));
		const { text } = await scraper.fetch(cfg.url, options);
		const items = buildJinaMarkdownLabelRows(text, cfg);

		if (items.length === 0) {
			return {
				ok: false,
				status: 502,
				body: {
					success: false,
					error: 'No prices found in page content',
					timestamp,
					source: cfg.name,
					currency: cfg.currency,
				},
			};
		}

		return {
			ok: true,
			status: 200,
			body: {
				success: true,
				data: items,
				count: items.length,
				timestamp,
				source: cfg.name,
				currency: cfg.currency,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return {
			ok: false,
			status: 500,
			body: {
				success: false,
				error: message,
				timestamp,
				source: cfg.name,
				currency: cfg.currency,
			},
		};
	}
}

export async function scrapeJinaMarkdownLabelForFetchOrCache(
	env: JinaMarkdownLabelScrapeEnv,
	cfg: JinaMarkdownLabelPriceConfig,
	options?: ScrapingOptions,
): Promise<JinaMarkdownLabelFetchOrCacheScrapeResult> {
	const r = await scrapeJinaMarkdownLabelPrices(env, cfg, options);
	if (!r.ok) {
		const b = r.body;
		const inactive = r.status === 400 && b.error === 'inactive';
		return {
			success: false,
			error: b.error,
			timestamp: b.timestamp,
			source: b.source,
			currency: b.currency,
			inactive,
		};
	}
	const b = r.body;
	return {
		success: true,
		data: b.data,
		timestamp: b.timestamp,
		source: b.source,
		currency: b.currency,
	};
}
