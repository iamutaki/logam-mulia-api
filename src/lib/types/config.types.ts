import type { HttpMethod, JsonFieldMapping, JsonApiItem, ScraperItem, TransformFn, RawValue } from './scraper.types';

export interface BaseConfig {
	name: string;
	url: string;
	engine: 'cheerio' | 'axios' | 'jina';
	currency?: string;
	active?: boolean;
	cached?: boolean;
	method?: HttpMethod | 'GET';
	responseType?: 'text' | 'json';
	headers?: Record<string, string>;
	body?: unknown;
}

export interface HtmlScraperConfig<T extends string = string> {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	cover?: string | null;
	urlHomepage?: string;
	url: string;
	engine: 'cheerio';
	/** When set, fetch via Jina Reader (bypasses Akamai bot blocking on the target). */
	proxy?: 'jina';
	currency?: string;
	active?: boolean;
	cached?: boolean;
	method?: 'GET';
	responseType?: 'text';
	headers?: Record<string, string>;
	body?: unknown;
	selector?: Record<T, string | RawValue>;
	postProcess?: TransformFn;
	items?: ScraperItem<T>[];
}

export interface JsonApiConfig {
	name: string;
	displayName?: string;
	logo?: string;
	favicon?: string | null;
	urlHomepage?: string;
	url: string;
	engine: 'axios';
	responseType?: 'json';
	method?: HttpMethod;
	currency?: string;
	active?: boolean;
	cached?: boolean;
	headers?: Record<string, string>;
	body?: unknown;
	selector?: JsonFieldMapping[];
	items?: JsonApiItem[];
	postProcess?: TransformFn;
}

export type AnyScraperConfig<T extends string = string> =
	| HtmlScraperConfig<T>
	| JsonApiConfig;

/** @deprecated Use HtmlScraperConfig */
export type ScrapingConfig<T extends string = string> = HtmlScraperConfig<T>;

/** @deprecated Use HtmlScraperConfig */
export type CheerioScrapingConfig<T extends string = string> = HtmlScraperConfig<T>;

/** @deprecated Use JsonApiConfig */
export type AxiosScrapingConfig = JsonApiConfig;

/** @deprecated Use BaseConfig */
export type BaseScrapingConfig = BaseConfig;

/** @deprecated Use AnyScraperConfig */
export type AnyScrapingConfig<T extends string = string> = AnyScraperConfig<T>;

export interface NewsDetailSelectors {
	title: string;
	author: string;
	publishedAt: string;
	content: string;
	cover?: string;
	imageCaption?: string;
	updatedAt?: string;
	tags?: string;
	relatedNews?: string;
}
