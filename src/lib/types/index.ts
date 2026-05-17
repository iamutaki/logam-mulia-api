// API response types
export type { ApiResponse, ScrapingResult } from './api.types';

// Config types
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
	NewsDetailSelectors,
} from './config.types';

// Scraper/engine types
export type {
	RawValue,
	TransformFn,
	ScraperItem,
	HttpMethod,
	JsonFieldMapping,
	JsonApiItem,
	FetchOptions,
	ScrapingOptions,
	AxiosSelectorDefinition,
	AxiosItemDefinition,
	AxiosMethod,
	ItemDefinition,
	ScrapingPostProcess,
} from './scraper.types';

export { raw } from './scraper.types';
