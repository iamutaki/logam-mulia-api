import type { JsonApiConfig } from '../../../../lib';

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
	postProcess: (raw) => {
		const data = raw as Record<string, unknown>;
		const outerData = (data?.data as Record<string, unknown>) ?? {};
		const allGrafik = outerData.allGrafik as Array<Record<string, unknown>> | undefined;
		if (!Array.isArray(allGrafik)) return { hargaJual: '', hargaBeli: '' };

		// allGrafik alternates sell/buy per interval: [jual7, beli7, jual30, beli30, ...]
		const sellSeries = allGrafik.find((g) => g.tipe === 'jual');
		const buySeries = allGrafik.find((g) => g.tipe === 'beli');

		const getLatestPrice = (series: Record<string, unknown> | undefined): string => {
			const fluk = series?.jsonFluktuasi as Record<string, unknown> | undefined;
			const list = fluk?.priceList as Array<Record<string, unknown>> | undefined;
			if (!Array.isArray(list) || list.length === 0) return '';
			// API is newest-first: index 0 = today's price
			const latest = list[0];
			// Only return price if lastUpdate matches series updateDate (fresh today)
			const updateDate = series?.updateDate as string | undefined;
			const lastUpdate = latest.lastUpdate as string | undefined;
			if (!updateDate || !lastUpdate) return String(latest.harga ?? '');
			// Convert "2026-06-30 00:00:00" → "2026-06-30T00:00:00.000Z"
			const normalizedLast = lastUpdate.replace(' ', 'T') + '.000Z';
			if (normalizedLast !== updateDate) return '';
			return String(latest.harga ?? '');
		};

		return {
			hargaJual: getLatestPrice(sellSeries),
			hargaBeli: getLatestPrice(buySeries),
		};
	},
	selector: [
		{
			sellPrice: 'hargaJual',
			buybackPrice: 'hargaBeli',
			weight: 0.01,
			weightUnit: 'gram',
		},
	],
};
