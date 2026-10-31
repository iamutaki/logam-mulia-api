import type { Bindings } from '../../../../types';
import {
	scrapeJinaMarkdownLabelForFetchOrCache,
	scrapeJinaMarkdownLabelPrices,
	type JinaMarkdownLabelFetchOrCacheScrapeResult,
	type JinaMarkdownLabelScrapeBody,
	type JinaMarkdownLabelScrapeResult,
} from '../../../../lib/scrapers/jina-markdown-label-scrape';
import type { ScrapingOptions } from '../../../../lib/types/scraper.types';
import { pluangConfig } from './config';

export type PluangScrapeBody = JinaMarkdownLabelScrapeBody;
export type PluangScrapeResult = JinaMarkdownLabelScrapeResult;
export type PluangFetchOrCacheScrapeResult = JinaMarkdownLabelFetchOrCacheScrapeResult;

export async function scrapePluangForFetchOrCache(
	env: Bindings,
	options?: ScrapingOptions,
): Promise<PluangFetchOrCacheScrapeResult> {
	return scrapeJinaMarkdownLabelForFetchOrCache(env, pluangConfig, options);
}

export async function scrapePluangPrices(
	env: Bindings,
	options?: ScrapingOptions,
): Promise<PluangScrapeResult> {
	return scrapeJinaMarkdownLabelPrices(env, pluangConfig, options);
}
