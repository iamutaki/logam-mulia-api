import { Hono } from 'hono';
import * as cheerio from 'cheerio';
import { CheerioScraper, createErrorResponse, defaultScrapingOptions } from '../../../../lib';
import { investorIdConfig, investorIdDetailSelectors } from './config';

import type { Bindings } from '../../../../types';
const app = new Hono<{ Bindings: Bindings }>();

const scraper = new CheerioScraper('investor-id', investorIdConfig);

function cleanText(raw: string | undefined): string {
	if (!raw) return '';
	return raw
		.replace(/^[\s.]*\.\.\.[\s.)]*/g, '')
		.replace(/^BERITA\s+(POPULER|TERBARU)\s*[:：]\s*/i, '')
		.replace(/[\s.]*\.\.\.[\s.]*$/g, '')
		.trim();
}

function cleanDate(raw: string | undefined): string {
	if (!raw) return '';
	return raw.replace(/\s+/g, ' ').trim();
}

function resolveUrl(raw: string | undefined, base: string): string {
	if (!raw) return '';
	if (raw.startsWith('http')) return raw;
	return `${base.replace(/\/$/, '')}${raw}`;
}

function extractSelector($: cheerio.CheerioAPI, sel: string): string {
	if (sel.startsWith('@')) {
		const idx = sel.indexOf('|');
		const attr = sel.slice(1, idx);
		const css = sel.slice(idx + 1);
		return ($(css).attr(attr) ?? '').trim();
	}
	return $(sel).text().trim();
}

function extractFirst($: cheerio.CheerioAPI, sel: string): string {
	const parts = sel.split(',').map((s) => s.trim());
	for (const part of parts) {
		const val = extractSelector($, part);
		if (val) return val;
	}
	return '';
}

app.get('/', async (c) => {
		const result = await scraper.scrape(
			(raw) => ({
				title: cleanText(raw.title),
				url: resolveUrl(raw.url, investorIdConfig.urlHomepage ?? ''),
				publishedAt: cleanDate(raw.publishedAt),
				summary: cleanText(raw.summary),
				category: cleanText(raw.category),
			}),
			defaultScrapingOptions,
		);

	if (!result.success) {
		return c.json(createErrorResponse(result.error ?? 'Unknown error'), 500);
	}

	return c.json(result);
});

app.get('/detail', async (c) => {
	const url = c.req.query('url');
	if (!url) {
		return c.json(createErrorResponse('Missing url parameter'), 400);
	}

	try {
		const res = await fetch(url);
		if (!res.ok) {
			return c.json(createErrorResponse(`Failed to fetch: HTTP ${res.status}`), 502);
		}
		const html = await res.text();
		const $ = cheerio.load(html);

		const data = {
			title: cleanText(extractFirst($, investorIdDetailSelectors.title)),
			author: cleanText(extractFirst($, investorIdDetailSelectors.author)),
			publishedAt: cleanDate(extractFirst($, investorIdDetailSelectors.publishedAt)),
			content: extractFirst($, investorIdDetailSelectors.content),
			mainImage: investorIdDetailSelectors.mainImage
				? extractFirst($, investorIdDetailSelectors.mainImage)
				: undefined,
			imageCaption: investorIdDetailSelectors.imageCaption
				? cleanText(extractFirst($, investorIdDetailSelectors.imageCaption))
				: undefined,
			tags: investorIdDetailSelectors.tags
				? extractFirst($, investorIdDetailSelectors.tags)
				: undefined,
			relatedNews: investorIdDetailSelectors.relatedNews
				? cleanText(extractFirst($, investorIdDetailSelectors.relatedNews))
				: undefined,
		};

		return c.json({
			success: true,
			data,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return c.json(
			createErrorResponse(error instanceof Error ? error.message : 'Unknown error'),
			500,
		);
	}
});

export default app;
