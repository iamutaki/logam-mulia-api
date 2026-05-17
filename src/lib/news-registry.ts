import type { Bindings } from '../types';
import { createNewsSourceRoute, createNewsDetailRoute, listNewsSourcesRoute } from './openapi-helpers';
import * as cheerio from 'cheerio';

let coverCache = new Map<string, string | null>();

async function resolveCoverLazy(raw: string | null | undefined, homepage: string): Promise<string | null> {
	if (!raw || !raw.startsWith('@')) return (raw as string | null) ?? null;
	const key = raw;
	if (coverCache.has(key)) return coverCache.get(key) ?? null;
	const idx = raw.indexOf('|');
	if (idx === -1) return null;
	const attr = raw.slice(1, idx);
	const sel = raw.slice(idx + 1);
	try {
		const res = await fetch(homepage, {
			headers: { 'User-Agent': 'LogamMuliaAPI/1.0' },
		});
		if (!res.ok) { coverCache.set(key, null); return null; }
		const html = await res.text();
		const $ = cheerio.load(html);
		const val = ($(sel).attr(attr) ?? null) as string | null;
		coverCache.set(key, val);
		return val;
	} catch {
		coverCache.set(key, null);
		return null;
	}
}
import type { Hono } from 'hono';
import type { OpenAPIHono } from '@hono/zod-openapi';

export interface NewsFeatureRegistration {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	cover?: string | null;
	urlHomepage?: string;
	url: string;
	route: Hono<{ Bindings: Bindings }>;
	cached: boolean;
}

export interface NewsSourceInfo {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	cover?: string | null;
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
	const detailRoute = createNewsDetailRoute();

	const sources: NewsSourceInfo[] = [];

	for (const mod of newsModules) {
		const { name, displayName, logo, favicon, cover, urlHomepage, url: sourcePageUrl, route } = mod.register();
		const sourceUrl = `/api/news/${name}`;

		app.openAPIRegistry.registerPath({ ...sourceRoute, path: sourceUrl });
		app.openAPIRegistry.registerPath({ ...detailRoute, path: `${sourceUrl}/detail` });

		app.use(sourceUrl, async (c, next) => {
			await next();
			try {
				const clone = c.res.clone();
				const json = (await clone.json()) as Record<string, unknown>;
				const resolvedCover = await resolveCoverLazy(cover, sourcePageUrl);
				const meta = { url: sourceUrl, displayName, logo, favicon, cover: resolvedCover, urlHomepage };

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

		sources.push({ name, displayName, logo, favicon, cover, url: sourceUrl, urlHomepage });
	}

	app.openapi(listRoute, async (c) => {
		const data = await Promise.all(
			sources.map(async (s) => ({
				...s,
				cover: await resolveCoverLazy(s.cover!, s.urlHomepage ?? ''),
			})),
		);
		return c.json({ data });
	});

	return sources;
}
