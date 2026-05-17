import { Hono } from 'hono';
import type { Bindings } from '../../../../types';
import { createErrorResponse, defaultFetchOptions, HtmlScraper, parseCurrency } from '../../../../lib';
import { fetchOrCache } from '../../../../lib/services/price-service';
import { anekalogamConfig } from './config';

const app = new Hono<{ Bindings: Bindings }>();

const scraper = new HtmlScraper('anekalogam', anekalogamConfig);

app.get('/', async (c) => {
	const refresh = c.req.query('refresh') === 'true';
	const result = await fetchOrCache(c.env, 'anekalogam', { refresh }, () =>
		scraper.scrape(
			(raw) => ({
				material: raw.material || 'gold',
				materialType: raw.materialType || 'unknown',
				buybackPrice: parseCurrency(raw.buybackPrice),
				sellPrice: parseCurrency(raw.sellPrice),
				weight: raw.weight ? Number(raw.weight) : 1,
				weightUnit: raw.weightUnit || 'gr',
			}),
			defaultFetchOptions,
		),
	);

	if (!result.success) {
		return c.json(createErrorResponse(result.error ?? 'Unknown error'), 500);
	}

	return c.json(result);
});

export default app;
