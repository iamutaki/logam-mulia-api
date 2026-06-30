import { Hono } from 'hono';
import type { Bindings } from '../../../../types';
import { CheerioScraper, createErrorResponse, parseCurrency } from '../../../../lib';
import { fetchOrCache } from '../../../../lib/services/price-service';
import { logammuliaConfig } from './config';

const app = new Hono<{ Bindings: Bindings }>();

const scraper = new CheerioScraper('logammulia', logammuliaConfig);

app.get('/', async (c) => {
	const refresh = c.req.query('refresh') === 'true';
	const result = await fetchOrCache(c.env, 'logammulia', { refresh }, () =>
		scraper.scrape(
			(raw) => ({
				lineKey: raw.lineKey ?? '',
				material: raw.material || 'gold',
				materialType: raw.materialType || 'unknown',
				buybackPrice: parseCurrency(raw.buybackPrice),
				sellPrice: parseCurrency(raw.sellPrice),
				weight: raw.weight ? Number(raw.weight) : 1,
				weightUnit: raw.weightUnit || 'gr',
			}),
			// proxy:'jina' makes fetchHtml hit r.jina.ai/<url>; X-Return-Format:html returns the
			// original DOM so the existing cheerio selectors resolve unchanged.
			{
				headers: {
					'X-Return-Format': 'html',
					...(c.env.JINA_API_KEY ? { Authorization: `Bearer ${c.env.JINA_API_KEY}` } : {}),
				},
				timeout: 15000,
				retries: 2,
			},
		),
	);

	if (!result.success) {
		return c.json(createErrorResponse(result.error ?? 'Unknown error'), 500);
	}

	return c.json(result);
});

export default app;
