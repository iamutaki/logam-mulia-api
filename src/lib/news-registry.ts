import type { Bindings } from '../types';
import { createNewsSourceRoute, listNewsSourcesRoute } from './openapi-helpers';
import type { Hono } from 'hono';
import type { OpenAPIHono } from '@hono/zod-openapi';

export interface NewsFeatureRegistration {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	urlHomepage?: string;
	route: Hono<{ Bindings: Bindings }>;
	cached: boolean;
}

export interface NewsSourceInfo {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	url: string;
	urlHomepage?: string;
}

export interface NewsFeatureModule {
	register: () => NewsFeatureRegistration;
}

// To add a new news source: (1) create src/features/api/news/{name}/, (2) add one import + one entry below.
import * as investorId from '../features/api/news/investor-id';

const newsModules: NewsFeatureModule[] = [
	investorId,
];

export function registerNewsFeatures(
	app: OpenAPIHono<{ Bindings: Bindings }>,
): NewsSourceInfo[] {
	const listRoute = listNewsSourcesRoute;
	const sourceRoute = createNewsSourceRoute();

	app.openapi(listRoute, (c) => {
		return c.json({ data: newsModules.map((mod) => {
			const { name, displayName, logo, favicon, urlHomepage } = mod.register();
			return { name, displayName, logo, favicon, url: `/api/news/${name}`, urlHomepage };
		}) });
	});

	return newsModules.map((mod) => {
		const { name, displayName, logo, favicon, urlHomepage, route } = mod.register();
		const sourceUrl = `/api/news/${name}`;

		app.openAPIRegistry.registerPath({ ...sourceRoute, path: sourceUrl });

		app.use(sourceUrl, async (c, next) => {
			await next();
			try {
				const clone = c.res.clone();
				const json = (await clone.json()) as Record<string, unknown>;
				const meta = { url: sourceUrl, displayName, logo, favicon, urlHomepage };

				if (Array.isArray(json.data)) {
					json.data = (json.data as Record<string, unknown>[]).map(
						(item) => ({ ...meta, ...item }),
					);
				} else if (json.data && typeof json.data === 'object') {
					json.data = { ...meta, ...(json.data as Record<string, unknown>) };
				}

				c.res = c.json(json);
			} catch {
				// non-JSON response, skip metadata injection
			}
		});
		app.route(sourceUrl, route);

		return { name, displayName, logo, favicon, url: sourceUrl, urlHomepage };
	});
}
