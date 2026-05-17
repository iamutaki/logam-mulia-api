import type { Bindings } from '../types';
import { createPriceSourceRoute } from './openapi-helpers';
import type { Hono } from 'hono';
import type { OpenAPIHono } from '@hono/zod-openapi';

export interface FeatureRegistration {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	cover?: string | null;
	urlHomepage?: string;
	route: Hono<{ Bindings: Bindings }>;
	cached: boolean;
}

export interface SourceInfo {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	cover?: string | null;
	url: string;
	urlHomepage?: string;
}

export interface PriceFeatureModule {
	register: () => FeatureRegistration;
}

// --- Price feature imports ---
// To add a new price source: (1) create src/features/api/prices/{name}/, (2) add one import + one entry below.
import * as anekalogam from '../features/api/prices/anekalogam';
import * as bankbsi from '../features/api/prices/bankbsi';
import * as brankaslm from '../features/api/prices/brankaslm';
import * as cermati from '../features/api/prices/cermati';
import * as emasku from '../features/api/prices/emasku';
import * as galeri24 from '../features/api/prices/galeri24';
import * as hargaemasCom from '../features/api/prices/hargaemas-com';
import * as hargaemasNet from '../features/api/prices/hargaemas-net';
import * as hargaemasOrg from '../features/api/prices/hargaemas-org';
import * as hartadinataabadi from '../features/api/prices/hartadinataabadi';
import * as indogold from '../features/api/prices/indogold';
import * as kursdolar from '../features/api/prices/kursdolar';
import * as lakuemas from '../features/api/prices/lakuemas';
import * as logammulia from '../features/api/prices/logammulia';
import * as pegadaian from '../features/api/prices/pegadaian';
import * as sakumas from '../features/api/prices/sakumas';
import * as sampoernagold from '../features/api/prices/sampoernagold';
import * as treasury from '../features/api/prices/treasury';

const priceModules: PriceFeatureModule[] = [
	anekalogam, bankbsi, brankaslm, cermati, emasku, galeri24,
	hargaemasCom, hargaemasNet, hargaemasOrg, hartadinataabadi,
	indogold, kursdolar, lakuemas, logammulia, pegadaian,
	sakumas, sampoernagold, treasury,
];

export function registerPriceFeatures(
	app: OpenAPIHono<{ Bindings: Bindings }>,
): SourceInfo[] {
	const priceRoute = createPriceSourceRoute();

	return priceModules.map((mod) => {
		const { name, displayName, logo, favicon, cover, urlHomepage, route } = mod.register();
		const sourceUrl = `/api/prices/${name}`;

		app.openAPIRegistry.registerPath({ ...priceRoute, path: sourceUrl });

		app.use(sourceUrl, async (c, next) => {
			await next();
			try {
				const clone = c.res.clone();
				const json = (await clone.json()) as Record<string, unknown>;
				const meta = { url: sourceUrl, displayName, logo, favicon, cover, urlHomepage };

				if (Array.isArray(json.data)) {
					json.data = (json.data as Record<string, unknown>[]).map(
						(item) => ({ ...item, ...meta }),
					);
				} else if (json.data && typeof json.data === 'object') {
					json.data = { ...(json.data as Record<string, unknown>), ...meta };
				}

				c.res = c.json(json);
			} catch {
				// non-JSON response, skip metadata injection
			}
		});
		app.route(sourceUrl, route);

		return { name, displayName, logo, favicon, cover, url: sourceUrl, urlHomepage };
	});
}
