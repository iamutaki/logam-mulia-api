import { Hono } from 'hono';
import { AxiosScraper, createErrorResponse, defaultScrapingOptions, parseCurrency } from '../../../../lib';
import { fetchOrCache } from '../../../../lib/services/price-service';
import { pluangConfig } from './config';

import type { Bindings } from '../../../../types';
const app = new Hono<{ Bindings: Bindings }>();

const scraper = new AxiosScraper('pluang', pluangConfig);

app.get('/', async (c) => {
	const refresh = c.req.query('refresh') === 'true';
	const result = await fetchOrCache(c.env, pluangConfig.name, { refresh }, () =>
		scraper.scrape(
			(raw) => ({
				material: raw.material || 'gold',
				materialType: raw.materialType || 'unknown',
				buybackPrice: parseCurrency(raw.buybackPrice),
				sellPrice: parseCurrency(raw.sellPrice),
				weight: raw.weight ? Number(raw.weight) : 1,
				weightUnit: raw.weightUnit || 'gr',
			}),
			{
				...defaultScrapingOptions,
				headers: {
					'x-request-id': crypto.randomUUID(),
				},
			},
		),
	);

	if (!result.success) {
		return c.json(createErrorResponse(result.error ?? 'Unknown error'), 500);
	}

	return c.json(result);
});

export default app;
