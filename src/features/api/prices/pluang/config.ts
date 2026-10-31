import type { JinaMarkdownLabelPriceConfig } from '../../../../lib/scrapers/jina-markdown-label-scrape';

/**
 * Pluang public JSON API (`api-pluang.pluang.com`) returns Akamai 403 from
 * Cloudflare Worker egress. Page markdown via Jina is the stable path (same idea as lakuemas).
 *
 * Domain mapping from pluang.com copy:
 * - "Harga beli emas" = platform sell to user → sellPrice
 * - "Harga jual kembali (buyback)" → buybackPrice
 */
export const pluangSellPriceRe =
	/Harga beli emas\s+Rp\s*([\d.]+)\s+per gram/i;

export const pluangBuybackPriceRe =
	/Harga jual kembali\s*\(buyback\)\s+Rp\s*([\d.]+)\s+per gram/i;

export const pluangConfig: JinaMarkdownLabelPriceConfig = {
	name: 'pluang',
	displayName: 'Pluang',
	logo: '',
	urlHomepage: 'https://pluang.com/asset/gold',
	url: 'https://pluang.com/asset/gold',
	currency: 'IDR',
	active: true,
	items: [
		{
			weight: 1,
			weightUnit: 'gram',
			materialType: 'unknown',
			material: 'gold',
			sellPriceRegex: pluangSellPriceRe,
			buybackPriceRegex: pluangBuybackPriceRe,
		},
	],
};
