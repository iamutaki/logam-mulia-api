// Scrapers
export { HtmlScraper, CheerioScraper } from './scrapers/html-scraper';
export { JsonApiScraper, AxiosScraper } from './scrapers/json-api-scraper';
export { JinaScraper, resolveJinaApiKeys } from './scrapers/jina-scraper';
export {
	buildJinaMarkdownLabelRows,
	scrapeJinaMarkdownLabelForFetchOrCache,
	scrapeJinaMarkdownLabelPrices,
} from './scrapers/jina-markdown-label-scrape';
export type {
	JinaMarkdownLabelFetchOrCacheScrapeResult,
	JinaMarkdownLabelPriceConfig,
	JinaMarkdownLabelRowConfig,
	JinaMarkdownLabelRowResult,
	JinaMarkdownLabelScrapeBody,
	JinaMarkdownLabelScrapeEnv,
	JinaMarkdownLabelScrapeResult,
} from './scrapers/jina-markdown-label-scrape';

// Constants
export { defaultFetchOptions, defaultScrapingOptions } from './constants/fetch-options';

// Utils
export {
	dateOnlyFromIsoTimestamp,
	jakartaCalendarDateString,
	utcCalendarDateString,
} from './utils/calendar-date';
export { parseCurrency } from './utils/currency';
export { parseGramWeightLabel } from './utils/parse-gram-weight-label';
export type { GramWeightLabelParseResult, ParseGramWeightLabelOptions } from './utils/parse-gram-weight-label';
export { normalizePriceRows } from './utils/price-response';

// Services
export { getHistoryBySource, normalizePagination } from './services/history-service';
export { fetchOrCache } from './services/price-service';

// HTTP errors
export { createErrorResponse } from './http-error';
export type { ErrorResponse, ApiErrorResponse } from './http-error';

// Types
export type { PriceRow } from './utils/price-response';
export type {
	ApiResponse,
	ScrapingResult,
} from './types/api.types';
export type {
	BaseConfig,
	HtmlScraperConfig,
	JsonApiConfig,
	AnyScraperConfig,
	ScrapingConfig,
	CheerioScrapingConfig,
	AxiosScrapingConfig,
	BaseScrapingConfig,
	AnyScrapingConfig,
} from './types/config.types';
export type {
	RawValue,
	TransformFn,
	ScrapingPostProcess,
	ScraperItem,
	ItemDefinition,
	HttpMethod,
	AxiosMethod,
	JsonFieldMapping,
	AxiosSelectorDefinition,
	JsonApiItem,
	AxiosItemDefinition,
	FetchOptions,
	ScrapingOptions,
} from './types/scraper.types';
export { raw } from './types/scraper.types';
