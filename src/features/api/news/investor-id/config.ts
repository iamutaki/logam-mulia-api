import type { HtmlScraperConfig, NewsDetailSelectors } from '../../../../lib/types';

const ARTICLE_COUNT = 10;

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
		},
	};
}

export const investorIdConfig: HtmlScraperConfig<
	'title' | 'url' | 'publishedAt' | 'summary' | 'category'
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
	title: 'header h1',
	author: '.article-author .author-name',
	publishedAt: 'header .article-date, time.published-at',
	content: '.article-body, .content, #article-content',
	mainImage: '@src|.article-featured-image img, @src|header figure img',
	imageCaption: '.article-featured-image figcaption',
	tags: '.article-tags a, .tags a',
	relatedNews: '.related-news-item a',
};
