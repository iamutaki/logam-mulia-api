import { z } from 'zod';

export const priceItemSchema = z.object({
	source: z.string().openapi({ example: 'anekalogam' }),
	material: z.string().openapi({ example: 'gold' }),
	materialType: z.string().openapi({ example: 'Antam' }),
	weight: z.number().openapi({ example: 1 }),
	weightUnit: z.string().openapi({ example: 'gr' }),
	sellPrice: z.number().openapi({ example: 2700000 }),
	buybackPrice: z.number().nullable().openapi({ example: 2650000 }),
	currency: z.string().openapi({ example: 'IDR' }),
	recordedDate: z.string().openapi({ example: '2026-05-16' }),
	lineKey: z.string().openapi({ example: '' }),
	url: z.string().optional().openapi({ example: '/api/prices/anekalogam' }),
	displayName: z.string().optional().openapi({ example: 'Aneka Logam' }),
	logo: z.string().optional().openapi({ example: '' }),
	favicon: z.string().nullable().optional().openapi({ example: null }),
	cover: z.string().nullable().optional().openapi({ example: null }),
	urlHomepage: z.string().optional().openapi({ example: 'https://www.anekalogam.co.id' }),
}).openapi('PriceItem');

export const priceResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	data: z.array(priceItemSchema).optional().openapi({ description: 'Array of price items' }),
	count: z.number().optional().openapi({ example: 9 }),
	timestamp: z.string().openapi({ example: '2026-05-16T05:06:58.888Z' }),
	cached: z.boolean().optional().openapi({ example: true }),
	source: z.string().optional(),
	currency: z.string().optional(),
}).openapi('PriceResponse');

export const errorResponseSchema = z.object({
	success: z.boolean().openapi({ example: false }),
	error: z.string().openapi({ example: 'Unknown error' }),
	timestamp: z.string().openapi({ example: '2026-05-16T05:06:58.888Z' }),
}).openapi('ErrorResponse');

export const sourceInfoSchema = z.object({
	name: z.string().openapi({ example: 'anekalogam' }),
	displayName: z.string().optional().openapi({ example: 'Aneka Logam' }),
	logo: z.string().optional(),
	favicon: z.string().nullable().optional(),
	cover: z.string().nullable().optional(),
	url: z.string().openapi({ example: '/api/prices/anekalogam' }),
	urlHomepage: z.string().optional().openapi({ example: 'https://www.anekalogam.co.id' }),
}).openapi('SourceInfo');

export const historyItemSchema = z.object({
	source: z.string(),
	material: z.string(),
	materialType: z.string(),
	weight: z.number(),
	weightUnit: z.string(),
	sellPrice: z.number(),
	buybackPrice: z.number().nullable(),
	currency: z.string(),
	recordedDate: z.string(),
	createdAt: z.string(),
	lineKey: z.string(),
	url: z.string().optional().openapi({ example: '/api/prices/anekalogam' }),
	displayName: z.string().optional().openapi({ example: 'Aneka Logam' }),
	logo: z.string().optional().openapi({ example: '' }),
	favicon: z.string().nullable().optional().openapi({ example: null }),
	cover: z.string().nullable().optional().openapi({ example: null }),
	urlHomepage: z.string().optional().openapi({ example: 'https://www.anekalogam.co.id' }),
}).openapi('HistoryItem');

export const historyPaginationSchema = z.object({
	page: z.number(),
	length: z.number(),
	total: z.number(),
	totalPages: z.number(),
}).openapi('HistoryPagination');

export const historyResponseSchema = z.object({
	success: z.boolean(),
	data: z.array(historyItemSchema).optional(),
	pagination: historyPaginationSchema.optional(),
	error: z.string().optional(),
}).openapi('HistoryResponse');

export const newsItemSchema = z.object({
	source: z.string().openapi({ example: 'detik' }),
	title: z.string().openapi({ example: 'Harga emas naik tipis hari ini' }),
	url: z.string().openapi({ example: 'https://finance.detik.com/...' }),
	publishedAt: z.string().openapi({ example: '2026-05-17T10:00:00Z' }),
	summary: z.string().optional(),
	category: z.string().optional(),
	displayName: z.string().optional().openapi({ example: 'Detik Finance' }),
	logo: z.string().optional(),
	favicon: z.string().nullable().optional(),
	cover: z.string().nullable().optional(),
	urlHomepage: z.string().optional(),
}).openapi('NewsItem');

export const newsResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	data: z.array(newsItemSchema).optional(),
	count: z.number().optional(),
	timestamp: z.string(),
	cached: z.boolean().optional(),
}).openapi('NewsResponse');
