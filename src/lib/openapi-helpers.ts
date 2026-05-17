import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
	errorResponseSchema,
	historyResponseSchema,
	newsItemSchema,
	newsResponseSchema,
	priceResponseSchema,
	sourceInfoSchema,
} from './schemas';

export const listSourcesRoute = createRoute({
	method: 'get',
	path: '/api/prices',
	request: {},
	responses: {
		200: {
			content: { 'application/json': { schema: z.object({ data: z.array(sourceInfoSchema) }) } },
			description: 'Daftar sumber yang tersedia',
		},
	},
	tags: ['Sources'],
});

export function createPriceSourceRoute() {
	return createRoute({
		method: 'get',
		path: '/',
		request: {
			query: z.object({
				refresh: z.enum(['true']).optional().openapi({
					description: 'Force re-scrape, bypass cache harian',
				}),
			}),
		},
		responses: {
			200: {
				content: { 'application/json': { schema: priceResponseSchema } },
				description: 'Data harga terkini',
			},
			500: {
				content: { 'application/json': { schema: errorResponseSchema } },
				description: 'Gagal scrape',
			},
		},
		tags: ['Sources'],
	});
}

export const historyRoute = createRoute({
	method: 'get',
	path: '/api/prices/{source}/history',
	request: {
		params: z.object({
			source: z.string().openapi({ description: 'Nama sumber' }),
		}),
		query: z.object({
			page: z
				.string()
				.optional()
				.openapi({ description: 'Nomor halaman (default 1)' }),
			length: z
				.string()
				.optional()
				.openapi({ description: 'Item per halaman (default 20, max 1000)' }),
			weight: z
				.string()
				.optional()
				.openapi({ description: 'Filter berat (gram)' }),
			material: z
				.string()
				.optional()
				.openapi({ description: 'Filter material (e.g. gold, silver)' }),
			materialType: z
				.string()
				.optional()
				.openapi({ description: 'Filter tipe material (e.g. Antam, UBS)' }),
		}),
	},
	responses: {
		200: {
			content: { 'application/json': { schema: historyResponseSchema } },
			description: 'Riwayat harga',
		},
		400: {
			content: { 'application/json': { schema: errorResponseSchema } },
			description: 'Parameter tidak valid',
		},
		404: {
			content: { 'application/json': { schema: errorResponseSchema } },
			description: 'Source tidak dikenal',
		},
		500: {
			content: { 'application/json': { schema: errorResponseSchema } },
			description: 'Server error',
		},
	},
	tags: ['History'],
});

export const listNewsSourcesRoute = createRoute({
	method: 'get',
	path: '/api/news',
	request: {},
	responses: {
		200: {
			content: { 'application/json': { schema: z.object({ data: z.array(sourceInfoSchema) }) } },
			description: 'Daftar sumber berita yang tersedia',
		},
	},
	tags: ['News'],
});

export function createNewsSourceRoute() {
	return createRoute({
		method: 'get',
		path: '/',
		request: {},
		responses: {
			200: {
				content: { 'application/json': { schema: newsResponseSchema } },
				description: 'Data berita terkini',
			},
			500: {
				content: { 'application/json': { schema: errorResponseSchema } },
				description: 'Gagal scrape',
			},
		},
		tags: ['News'],
	});
}

export function createNewsDetailRoute() {
	return createRoute({
		method: 'get',
		path: '/detail',
		request: {
			query: z.object({
				url: z.string().openapi({ description: 'URL artikel yang akan di-scrape' }),
			}),
		},
		responses: {
			200: {
				content: { 'application/json': { schema: newsResponseSchema } },
				description: 'Detail berita',
			},
			400: {
				content: { 'application/json': { schema: errorResponseSchema } },
				description: 'Missing url parameter',
			},
			500: {
				content: { 'application/json': { schema: errorResponseSchema } },
				description: 'Gagal scrape',
			},
		},
		tags: ['News'],
	});
}
