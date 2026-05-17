import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { createErrorResponse, getHistoryBySource } from './lib';
import { registerPriceFeatures } from './lib/feature-registry';
import type { Bindings } from './types';
import rootRoute from './features/root';
import healthRoute from './features/health';
import { listSourcesRoute, historyRoute } from './lib/openapi-helpers';

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.route('/', rootRoute);
app.route('/health', healthRoute);

const SOURCES = registerPriceFeatures(app);

app.openapi(listSourcesRoute, (c) => {
	return c.json({ data: SOURCES });
});

const SUPPORTED_SOURCES = new Set(SOURCES.map((s) => s.name));

const sourceByName = new Map(SOURCES.map((s) => [s.name, s]));

app.get('/api/prices/:source/history', async (c) => {
	const source = c.req.param('source');
	if (!SUPPORTED_SOURCES.has(source)) {
		return c.json(createErrorResponse('Unknown source'), 404);
	}

	const result = await getHistoryBySource(c.env, source, {
		page: c.req.query('page'),
		length: c.req.query('length'),
		weight: c.req.query('weight'),
		material: c.req.query('material'),
		materialType: c.req.query('materialType'),
	});

	if (!result.success) {
		const statusCode = result.statusCode === 400 ? 400 : 500;
		return c.json(createErrorResponse(result.error ?? 'Unknown error'), statusCode);
	}

	const info = sourceByName.get(source);
	const meta = {
		url: info?.url ?? `/api/prices/${source}`,
		displayName: info?.displayName,
		logo: info?.logo,
		urlHomepage: info?.urlHomepage,
	};

	return c.json({
		...result,
		data: result.data?.map((item) => ({ ...item, ...meta })),
	});
});

app.openAPIRegistry.registerPath(historyRoute);

app.doc('/api/docs/json', {
	openapi: '3.0.3',
	info: {
		title: 'Logam Mulia API',
		description:
			'API harga emas dan logam mulia dari berbagai sumber di Indonesia. Data discrape secara real-time dan di-cache per hari.',
		version: '1.0.0',
	},
	servers: [{ url: 'http://localhost:8787', description: 'Development' }],
	tags: [
		{ name: 'System', description: 'Root & health check' },
		{ name: 'Sources', description: 'Daftar & harga dari sumber logam mulia' },
		{ name: 'History', description: 'Riwayat harga' },
	],
});

app.get('/api/docs', Scalar({ url: '/api/docs/json' }));

export default app;
