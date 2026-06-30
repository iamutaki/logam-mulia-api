import type { FetchOptions } from '../types/scraper.types';

// Full Chrome navigation signature. Several sources (e.g. logammulia.com) sit behind
// Akamai Bot Manager, which scores a *combination* of Sec-Ch-Ua + Sec-Fetch + Accept-Encoding
// + Upgrade-Insecure-Requests; a partial header set is flagged as a bot (HTTP 403 Access Denied).
// Verified empirically: this set returns 200, subsets do not.
// ponytail: Referer intentionally omitted — unneeded for the bypass and risky for the JSON
// endpoints (pegadaian/treasury) that also inherit this default (Referer=google can trip CSRF/Origin checks).
export const defaultFetchOptions: FetchOptions = {
	headers: {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
		Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
		'Accept-Encoding': 'gzip, deflate, br',
		'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		'Sec-Ch-Ua-Mobile': '?0',
		'Sec-Ch-Ua-Platform': '"Windows"',
		'Sec-Fetch-Dest': 'document',
		'Sec-Fetch-Mode': 'navigate',
		'Sec-Fetch-Site': 'none',
		'Sec-Fetch-User': '?1',
		'Upgrade-Insecure-Requests': '1',
	},
	timeout: 15000,
	retries: 2,
};

/** @deprecated Use defaultFetchOptions */ export const defaultScrapingOptions = defaultFetchOptions;
