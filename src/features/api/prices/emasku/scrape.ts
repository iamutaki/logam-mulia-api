import type { Bindings } from '../../../../types';
import { parseCurrency } from '../../../../lib/utils/currency';
import { JinaScraper, resolveJinaApiKeys } from '../../../../lib/scrapers/jina-scraper';
import type { ScrapingOptions } from '../../../../lib/types/scraper.types';
import { emaskuConfig } from './config';

const HEADER_RE = /Berat \(gr\).*Harga Dasar.*Harga Buyback/i;
const SEPARATOR_RE = /^\|[\s\-:|]+\|$/;
const SECTION_RE = /^\|\s*([A-Za-z][\w ]*?)\s*\|$/;
const ROW_RE = /^\|\s*([\d.,]+)\s*gr\s*\|\s*Rp\s*([\d.,]+)\s*\|\s*Rp\s*([\d.,]+)\s*\|/;

export interface EmaskuRow {
	material: string;
	materialType: string;
	weight: number;
	weightUnit: string;
	sellPrice: number;
	buybackPrice: number | null;
}

function parseEmaskuTable(markdown: string): EmaskuRow[] {
	const lines = markdown.split('\n');
	let inTable = false;
	let section = '';
	const rows: EmaskuRow[] = [];

	for (const line of lines) {
		if (!inTable) {
			if (HEADER_RE.test(line)) inTable = true;
			continue;
		}

		if (SEPARATOR_RE.test(line)) continue;

		const sec = line.match(SECTION_RE);
		if (sec) {
			section = sec[1].trim();
			continue;
		}

		const m = line.match(ROW_RE);
		if (m) {
			rows.push({
				material: 'gold',
				materialType: section,
				weight: parseCurrency(m[1]),
				weightUnit: 'gr',
				sellPrice: parseCurrency(m[2]),
				buybackPrice: parseCurrency(m[3]) || null,
			});
		}

		if (line.trim() === '' && rows.length > 0) break;
	}

	return rows;
}

export type EmaskuFetchOrCacheScrapeResult = {
	success: boolean;
	data?: unknown;
	error?: string;
	timestamp: string;
	source: string;
	currency?: string;
	inactive?: boolean;
};

export async function scrapeEmaskuForFetchOrCache(
	env: Bindings,
	options?: ScrapingOptions,
): Promise<EmaskuFetchOrCacheScrapeResult> {
	const timestamp = new Date().toISOString();

	if (!emaskuConfig.active) {
		return { success: false, error: 'inactive', timestamp, source: emaskuConfig.name, currency: emaskuConfig.currency, inactive: true };
	}

	try {
		const scraper = new JinaScraper(resolveJinaApiKeys(env));
		const { text } = await scraper.fetch(emaskuConfig.url, options);
		const rows = parseEmaskuTable(text);

		if (rows.length === 0) {
			return { success: false, error: 'No prices found in page content', timestamp, source: emaskuConfig.name, currency: emaskuConfig.currency };
		}

		return { success: true, data: rows, timestamp, source: emaskuConfig.name, currency: emaskuConfig.currency };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return { success: false, error: message, timestamp, source: emaskuConfig.name, currency: emaskuConfig.currency };
	}
}
