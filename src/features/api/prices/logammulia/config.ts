import type { ScrapingConfig } from '../../../../lib/types';
import { raw } from '../../../../lib/types';

/**
 * Kolom kiri halaman harga — satu grid berisi tabel emas lalu tabel perak.
 * `div.main-container > div.row.box-white` unik untuk blok ini (bukan `.blue-box` lokasi / CTA).
 */
const priceGridChild =
	'section.section-padding.n-no-padding-top div.main-container > div.row.box-white > div.row > .grid-child:first-of-type';

const goldTable = `${priceGridChild} > table.table.table-bordered:first-of-type`;
const silverTable = `${priceGridChild} > table.table.table-bordered:nth-of-type(2)`;

/** Judul sub-blok: baris `th` (biasanya colspan) di dalam tabel terkait. */
function sectionHeaderTh(tableSelector: string, sectionHeaderRow: number): string {
	return `${tableSelector} tbody tr:nth-child(${sectionHeaderRow}) th`;
}

function postProcessRow(rawData: Record<string, string>) {
	const weightMatch = (rawData.weight ?? '').match(/[\d.,]+/);
	const weight = (weightMatch?.[0] ?? '1').replace(',', '.');

	return {
		...rawData,
		weight,
	};
}

/**
 * @param dataRow — `tr:nth-child` baris data (sel `td` berat / harga).
 * @param sectionHeaderRow — baris judul blok (`th`) untuk `materialType`.
 */
function makeItem(dataRow: number, sectionHeaderRow: number) {
	return {
		lineKey: `gold-${sectionHeaderRow}-tr${dataRow}`,
		selector: {
			weight: `${goldTable} tbody tr:nth-child(${dataRow}) > td:nth-child(1)`,
			sellPrice: `${goldTable} tbody tr:nth-child(${dataRow}) > td:nth-child(2)`,
			buybackPrice: raw(null),
			material: raw('gold'),
			materialType: sectionHeaderTh(goldTable, sectionHeaderRow),
			weightUnit: raw('gr'),
		},
		postProcess: postProcessRow,
	};
}

function makeItemSilver(dataRow: number, sectionHeaderRow: number) {
	return {
		lineKey: `silver-${sectionHeaderRow}-tr${dataRow}`,
		selector: {
			weight: `${silverTable} tbody tr:nth-child(${dataRow}) > td:nth-child(1)`,
			sellPrice: `${silverTable} tbody tr:nth-child(${dataRow}) > td:nth-child(2)`,
			buybackPrice: raw(null),
			material: raw('silver'),
			materialType: sectionHeaderTh(silverTable, sectionHeaderRow),
			weightUnit: raw('gr'),
		},
		postProcess: postProcessRow,
	};
}

/** Baris judul blok emas (`th`) — urutan baris di tabel bisa berubah jika situs mengubah layout. */
const SECTION_GOLD = {
	emasBatangan: 2,
	giftSeries: 15,
	idulFitri: 18,
	imlek: 20,
	batikSeriIII: 23,
} as const;

const SECTION_SILVER = {
	perakMurni: 1,
	perakHeritage: 5,
} as const;

export const logammuliaConfig: ScrapingConfig<
	'buybackPrice' | 'material' | 'materialType' | 'sellPrice' | 'weight' | 'weightUnit'
> = {
	name: 'logammulia',
	displayName: 'Logam Mulia',
	logo: '',
	urlHomepage: 'https://www.logammulia.com',
	engine: 'cheerio',
	proxy: 'jina',
	currency: 'IDR',
	url: 'https://www.logammulia.com/harga-emas-hari-ini',
	active: true,
	items: [
		...Array.from({ length: 12 }, (_, i) => makeItem(3 + i, SECTION_GOLD.emasBatangan)),
		...Array.from({ length: 2 }, (_, i) => makeItem(16 + i, SECTION_GOLD.giftSeries)),
		...Array.from({ length: 1 }, (_, i) => makeItem(19 + i, SECTION_GOLD.idulFitri)),
		...Array.from({ length: 2 }, (_, i) => makeItem(21 + i, SECTION_GOLD.imlek)),
		...Array.from({ length: 2 }, (_, i) => makeItem(24 + i, SECTION_GOLD.batikSeriIII)),
		...Array.from({ length: 2 }, (_, i) => makeItemSilver(3 + i, SECTION_SILVER.perakMurni)),
		...Array.from({ length: 2 }, (_, i) => makeItemSilver(7 + i, SECTION_SILVER.perakHeritage)),
	],
};
