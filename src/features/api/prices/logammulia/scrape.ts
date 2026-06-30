import type { ScrapingOptions } from '../../../../lib/types/scraper.types';
import { JinaScraper } from '../../../../lib/scrapers/jina-scraper';

const LOGAMMULIA_URL = 'https://www.logammulia.com/id/harga-emas-hari-ini';

interface LogamMuliaItem {
	lineKey: string;
	material: string;
	materialType: string;
	buybackPrice: number;
	sellPrice: number;
	weight: number;
	weightUnit: string;
}

/**
 * Parse Jina Reader markdown tables from logammulia.com.
 *
 * Jina converts <table> to markdown pipes:
 *   | Berat | Harga Dasar | Harga (+Pajak PPh 0.25%) |
 *   | --- | --- | --- |
 *   | Emas Batangan |
 *   | 0.5 gr | 1,365,000 | 1,368,413 |
 */
function parseLogamMuliaMarkdown(markdown: string): LogamMuliaItem[] {
	const lines = markdown.split('\n');
	const items: LogamMuliaItem[] = [];
	let currentSection = '';
	let lineKeyCounter = 0;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed.startsWith('|')) continue;

		const cells = trimmed
			.split('|')
			.map((c) => c.trim())
			.filter(Boolean);

		// Skip separator rows (---|---|---)
		if (cells.some((c) => /^-+$/.test(c))) continue;

		// Skip column-header rows
		const headerHints = ['berat', 'harga', 'beli', 'jual', 'dasar'];
		if (cells.length >= 2 && cells.some((c) => headerHints.includes(c.toLowerCase()))) {
			continue;
		}

		// Section header — 1–2 cells, non-numeric, not a weight value
		if (cells.length <= 2) {
			const maybeSection = cells[0] || '';
			if (maybeSection && !/^[\d.,]+\s*gr?$/i.test(maybeSection)) {
				currentSection = maybeSection;
			}
			continue;
		}

		// Data row: | weight | sell_price | with_pajak |
		const weightCell = cells[0]?.trim() || '';
		const sellPriceCell = cells[1]?.trim() || '';
		const weightMatch = weightCell.match(/^([\d.]+)\s*gr?$/i);
		if (!weightMatch || !sellPriceCell) continue;

		const weight = parseFloat(weightMatch[1].replace(',', '.'));
		const sellPrice = parseInt(sellPriceCell.replace(/,/g, ''), 10);
		if (!isFinite(weight) || !isFinite(sellPrice)) continue;

		// Skip non-gold/silver tables (e.g. Liontin)
		const lower = currentSection.toLowerCase();
		if (!lower.includes('emas') && !lower.includes('perak') && !lower.includes('batangan')) {
			continue;
		}

		lineKeyCounter++;
		items.push({
			lineKey: `logammulia-jina-${lineKeyCounter}`,
			material: lower.includes('perak') ? 'silver' : 'gold',
			materialType: currentSection,
			buybackPrice: 0,
			sellPrice,
			weight,
			weightUnit: 'gr',
		});
	}

	return items;
}

export async function scrapeLogamMuliaForFetchOrCache(
	env: { JINA_API_KEY?: string },
	options?: ScrapingOptions,
): Promise<{
	success: boolean;
	data?: LogamMuliaItem[];
	error?: string;
	timestamp: string;
	source: string;
	currency?: string;
}> {
	const timestamp = new Date().toISOString();

	try {
		const scraper = new JinaScraper(env.JINA_API_KEY);
		const { text } = await scraper.fetch(LOGAMMULIA_URL, options);
		const items = parseLogamMuliaMarkdown(text);

		if (items.length === 0) {
			return {
				success: false,
				error: 'No prices found in Jina page content',
				timestamp,
				source: 'logammulia',
				currency: 'IDR',
			};
		}

		return {
			success: true,
			data: items,
			timestamp,
			source: 'logammulia',
			currency: 'IDR',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp,
			source: 'logammulia',
			currency: 'IDR',
		};
	}
}
