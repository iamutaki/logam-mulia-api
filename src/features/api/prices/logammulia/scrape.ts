import type { Bindings } from '../../../../types';
import { parseCurrency } from '../../../../lib/utils/currency';
import { JinaScraper } from '../../../../lib/scrapers/jina-scraper';
import type { ScrapingOptions } from '../../../../lib/types/scraper.types';
import { logammuliaConfig } from './config';

const HEADER_RE = /Berat.*Harga Dasar/i;
const SEPARATOR_RE = /^\|[\s\-:|]+\|$/;
const SECTION_RE = /^\|\s*([A-Za-z][\w ]*?)\s*\|$/;
const ROW_RE = /^\|\s*([\d.]+)\s*gr\s*\|\s*([\d,]+)\s+\|\s*([\d,]+)/i;

export interface LogamMuliaRow {
	material: string;
	materialType: string;
	weight: number;
	weightUnit: string;
	sellPrice: number;
	buybackPrice: number | null;
}

function parseLogamMuliaTable(markdown: string): LogamMuliaRow[] {
	const lines = markdown.split('\n');
	let inTable = false;
	let section = '';
	const rows: LogamMuliaRow[] = [];

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
			const lower = section.toLowerCase();
			// Skip non-gold/silver tables (Liontin, etc.)
			if (!lower.includes('emas') && !lower.includes('perak') && !lower.includes('batangan')) continue;

			rows.push({
				material: lower.includes('perak') ? 'silver' : 'gold',
				materialType: section,
				weight: parseCurrency(m[1]),
				weightUnit: 'gr',
				sellPrice: parseCurrency(m[2]),
				buybackPrice: null,
			});
		}
	}

	return rows;
}

export type LogamMuliaFetchOrCacheScrapeResult = {
	success: boolean;
	data?: unknown;
	error?: string;
	timestamp: string;
	source: string;
	currency?: string;
	inactive?: boolean;
};

export async function scrapeLogamMuliaForFetchOrCache(
	env: Bindings,
	options?: ScrapingOptions,
): Promise<LogamMuliaFetchOrCacheScrapeResult> {
	const timestamp = new Date().toISOString();

	if (!logammuliaConfig.active) {
		return { success: false, error: 'inactive', timestamp, source: logammuliaConfig.name, currency: logammuliaConfig.currency, inactive: true };
	}

	try {
		const scraper = new JinaScraper(env.JINA_API_KEY);
		const { text } = await scraper.fetch(logammuliaConfig.url, options);
		const rows = parseLogamMuliaTable(text);

		if (rows.length === 0) {
			return { success: false, error: 'No prices found in page content', timestamp, source: logammuliaConfig.name, currency: logammuliaConfig.currency };
		}

		return { success: true, data: rows, timestamp, source: logammuliaConfig.name, currency: logammuliaConfig.currency };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return { success: false, error: message, timestamp, source: logammuliaConfig.name, currency: logammuliaConfig.currency };
	}
}
