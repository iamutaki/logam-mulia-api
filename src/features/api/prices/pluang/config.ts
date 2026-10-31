import type { JsonApiConfig } from '../../../../lib';

/**
 * Validates Pluang pricing payload and flattens current sell/buy for selector mapping.
 * Throws so JsonApiScraper returns success:false instead of caching zero prices.
 */
export function pluangPostProcess(raw: Record<string, unknown>): Record<string, string> {
	const statusCode = raw.statusCode;
	if (statusCode !== undefined && statusCode !== 200) {
		throw new Error(`Pluang API statusCode ${String(statusCode)}`);
	}

	const data = (raw.data as Record<string, unknown> | undefined) ?? {};
	const current = (data.current as Record<string, unknown> | undefined) ?? {};
	const sell = Number(current.sell);
	const buy = Number(current.buy);

	if (!Number.isFinite(sell) || sell <= 0 || !Number.isFinite(buy) || buy <= 0) {
		throw new Error('Invalid Pluang gold prices');
	}

	return {
		hargaJual: String(sell),
		hargaBeli: String(buy),
	};
}

export const pluangConfig: JsonApiConfig = {
	name: 'pluang',
	displayName: 'Pluang',
	logo: '',
	urlHomepage: 'https://pluang.com/asset/gold',
	url: 'https://api-pluang.pluang.com/api/v3/asset/gold/pricing?daysLimit=0',
	engine: 'axios',
	responseType: 'json',
	method: 'GET',
	currency: 'IDR',
	headers: {
		accept: 'application/json, text/plain, */*',
	},
	postProcess: (raw) => pluangPostProcess(raw),
	selector: [
		{
			sellPrice: 'hargaJual',
			buybackPrice: 'hargaBeli',
			weight: 1,
			weightUnit: 'gram',
		},
	],
};
