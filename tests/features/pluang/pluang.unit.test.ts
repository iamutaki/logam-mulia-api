import { describe, expect, it } from 'vitest';
import { buildJinaMarkdownLabelRows } from '../../../src/lib/scrapers/jina-markdown-label-scrape';
import {
	pluangBuybackPriceRe,
	pluangConfig,
	pluangSellPriceRe,
} from '../../../src/features/api/prices/pluang/config';

const fixtureMarkdown = `
## Harga Emas Hari Ini per Gram

Harga emas hari ini di Pluang adalah Rp2.304.125 per gram (harga tengah), diperbarui 31 Okt 2026. Harga beli emas Rp2.352.512 per gram. Harga jual kembali (buyback) Rp2.255.738 per gram.

| Berat | Harga beli | Harga jual kembali |
| --- | --- | --- |
| 1 gram | Rp2.352.512 | Rp2.255.738 |
`;

describe('pluang regex', () => {
	it('extracts sell (harga beli) and buyback from prose', () => {
		expect(fixtureMarkdown.match(pluangSellPriceRe)?.[1]).toBe('2.352.512');
		expect(fixtureMarkdown.match(pluangBuybackPriceRe)?.[1]).toBe('2.255.738');
	});

	it('does not match when prices are missing', () => {
		expect('no prices here'.match(pluangSellPriceRe)).toBeNull();
		expect('no prices here'.match(pluangBuybackPriceRe)).toBeNull();
	});
});

describe('pluang buildJinaMarkdownLabelRows', () => {
	it('maps 1g sell/buyback from fixture markdown', () => {
		const rows = buildJinaMarkdownLabelRows(fixtureMarkdown, pluangConfig);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			material: 'gold',
			materialType: 'unknown',
			weight: 1,
			weightUnit: 'gram',
			sellPrice: 2352512,
			buybackPrice: 2255738,
		});
	});

	it('returns empty when prose prices absent', () => {
		expect(buildJinaMarkdownLabelRows('| 1 gram | Rp1 | Rp2 |', pluangConfig)).toEqual([]);
	});
});
