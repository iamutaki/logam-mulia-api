import { parseGramWeightLabel } from '../../../../lib/utils/parse-gram-weight-label';
import type { HtmlScraperConfig } from '../../../../lib/types';
import { raw } from '../../../../lib/types';

const certicardMaterialTypeSelector =
	'body > section.section.home-certicard > div > div.certicard-row.row-2 > div.certicard-left > p';

function parseCerticardMaterialType(text: string): string {
	const match = text.match(/Harga berlaku untuk\s+(.+)/);
	return match?.[1]?.trim() ?? 'Antam';
}

function postProcessRow(rawData: Record<string, string>) {
	const label = (rawData.weight ?? rawData.weightUnit ?? '').trim();
	const { weight, weightUnit } = parseGramWeightLabel(label);
	return {
		...rawData,
		materialType: parseCerticardMaterialType(rawData.materialType ?? ''),
		weight: weight || rawData.weight,
		weightUnit: weightUnit || rawData.weightUnit,
	};
}

function makeItem(row: number, col: number) {
	const base = 'body > section.section.home-certicard > div > div.certicard-row.row-2 > div.certicard-left > table';
	return {
		selector: {
			buybackPrice: `${base} > tbody > tr:nth-child(${row}) > td:nth-child(3) > span > span:nth-child(2)`,
			sellPrice: `${base} > tbody > tr:nth-child(${row}) > td:nth-child(2) > span > span:nth-child(2)`,
			material: raw('gold'),
			materialType: certicardMaterialTypeSelector,
			weight: `${base} > tbody > tr:nth-child(${row}) > td:nth-child(1) > a`,
			weightUnit: `${base} > tbody > tr:nth-child(${row}) > td:nth-child(1) > a`,
		},
		postProcess: postProcessRow,
	};
}

export const anekalogamConfig: HtmlScraperConfig<'buybackPrice' | 'sellPrice' | 'material' | 'materialType' | 'weight' | 'weightUnit' > = {
	name: 'anekalogam',
	displayName: 'Aneka Logam',
	logo: '',
	urlHomepage: 'https://www.anekalogam.co.id',
	favicon:"https://www.logammulia.com/apple-touch-icon.png",
	engine: 'cheerio',
	currency: 'IDR',
	url: 'https://www.anekalogam.co.id/id',
	active: true,
	items: [
		{
			selector: {
				buybackPrice: '#today-price > div.section-intro > div.buy-sell-rate > div:nth-child(2) .tprice',
				sellPrice: '#today-price > div.section-intro > div.buy-sell-rate > div:nth-child(1) .tprice',
				material: raw('gold'),
				materialType: "#today-price > div.section-intro > p:nth-child(3)",
				weight: raw(1),
				weightUnit: raw('gr'),
			},
			postProcess: (rawData) => {
				const text = rawData.materialType ?? '';
				const match = text.match(/^Harga\s+(.+?)\s+dari Aneka Logam\.$/);

				return {
					...rawData,
					materialType: match?.[1]?.trim() ?? rawData.materialType ?? 'Antam',
				};
			},
		},
		...Array.from({ length: 8 }, (_, i) => makeItem(i + 1, 2)),
	],
};
