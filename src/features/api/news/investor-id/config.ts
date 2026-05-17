import type { HtmlScraperConfig, NewsDetailSelectors } from '../../../../lib/types';

const ARTICLE_COUNT = 20;

const resultsBlock = 'main > div:nth-child(3) > div.row > div.col';

function makeArticleItem(index: number) {
	const n = index + 1;
	const article = `${resultsBlock} > div:nth-child(${n}) > div.col-8.pt-l`;
	return {
		selector: {
			category: `${article} > a > span.id-cat`,
			publishedAt: `${article} > span.text-muted.small`,
			title: `${article} > a > h4`,
			summary: `${article} > span.text-muted.text-truncate-2-lines`,
			url: `@href|${article} > a:nth-child(4)`,
			cover: `@src|body > main > div:nth-child(3) > div > div.col > div:nth-child(${n}) > div.col-4 > a > div > img`,
		},
	};
}

export const investorIdConfig: HtmlScraperConfig<
	'title' | 'url' | 'publishedAt' | 'summary' | 'category' | 'cover'
> = {
	name: 'investor-id',
	displayName: 'Investor.id',
	logo: 'https://investor.id/img/logo_investorid.webp',
	favicon: 'https://investor.id/favicon-32x32.png',
	urlHomepage: 'https://investor.id',
	engine: 'cheerio',
	currency: '',
	url: 'https://investor.id/search/harga-emas',
	active: true,
	items: Array.from({ length: ARTICLE_COUNT }, (_, i) => makeArticleItem(i)),
};

export const investorIdDetailSelectors: NewsDetailSelectors = {
	title: 'body > main > div > div.row > div.col > h1',
	author: 'body > main > div > div.row > div.col > div.row.my-3 > div.col.small.pt-1 > b',
	publishedAt: 'body > main > div > div.row > div.col > div.row.my-3 > div.col.small.pt-1 > span',
	content: 'p|body > main > div > div.row > div.col > div.row.mt-3 > div',
	cover: '@src|body > main > div > div.row > div.col > div.rounded-3.overflow-hidden.mb-2 > img',
	imageCaption: '@alt|body > main > div > div.row > div.col > div.rounded-3.overflow-hidden.mb-2 > img',
	tags: 'body > main > div > div.row > div.col > div.row.mt-3 > div > div:nth-child(35)',
	relatedNews: '.related-news-item a',
};
