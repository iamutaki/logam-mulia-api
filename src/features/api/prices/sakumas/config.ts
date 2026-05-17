import type { HtmlScraperConfig } from '../../../../lib/types';

export const sakumasConfig: HtmlScraperConfig<'buybackPrice' | 'sellPrice'> = {
	name: 'sakumas',
	displayName: 'Sakumas',
	logo: 'https://sakumas.asastapayment.com/style/1/images/v2/logo.svg',
	urlHomepage: 'https://sakumas.asastapayment.com',
	engine: 'cheerio',
	currency: 'IDR',
	url: 'https://sakumas.asastapayment.com/',
	active: true,
	items: [
		{
			selector: {
				buybackPrice: '#hargaJual',
				sellPrice: '#hargaBeli',
			},
		},
	],
};
