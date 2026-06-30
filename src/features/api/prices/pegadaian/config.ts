import type { JsonApiConfig } from '../../../../lib';

function normalizeDate(lastUpdate: string): string {
	return lastUpdate.replace(' ', 'T') + '.000Z';
}

export function getLatestPrice(
	series: Record<string, unknown> | undefined,
): string {
	const fluk = series?.jsonFluktuasi as Record<string, unknown> | undefined;
	const list = fluk?.priceList as Array<Record<string, unknown>> | undefined;
	if (!Array.isArray(list) || list.length === 0) return '';
	// API is newest-first: index 0 = today's price
	const latest = list[0];
	// Only return price if lastUpdate matches series updateDate (fresh today)
	const updateDate = series?.updateDate as string | undefined;
	const lastUpdate = latest.lastUpdate as string | undefined;
	if (!updateDate || !lastUpdate) return String(latest.harga ?? '');
	if (normalizeDate(lastUpdate) !== updateDate) return '';
	return String(latest.harga ?? '');
}

export function pegadaianPostProcess(raw: Record<string, unknown>): Record<string, string> {
	const outerData = (raw?.data as Record<string, unknown>) ?? {};
	const allGrafik = outerData.allGrafik as Array<Record<string, unknown>> | undefined;
	if (!Array.isArray(allGrafik)) return { hargaJual: '', hargaBeli: '' };

	const sellSeries = allGrafik.find((g) => g.tipe === 'jual');
	const buySeries = allGrafik.find((g) => g.tipe === 'beli');

	return {
		hargaJual: getLatestPrice(sellSeries),
		hargaBeli: getLatestPrice(buySeries),
	};
}

export const pegadaianConfig: JsonApiConfig = {
	name: 'pegadaian',
	displayName: 'Pegadaian',
	logo: '',
	urlHomepage: 'https://sahabat.pegadaian.co.id',
	url: 'https://sahabat.pegadaian.co.id/gold/prices/chart?interval=7&isRequest=true',
	engine: 'axios',
	responseType: 'json',
	method: 'GET',
	currency: 'IDR',
	active: true,
	postProcess: (raw) => pegadaianPostProcess(raw),
	selector: [
		{
			sellPrice: 'hargaJual',
			buybackPrice: 'hargaBeli',
			weight: 0.01,
			weightUnit: 'gram',
		},
	],
};
