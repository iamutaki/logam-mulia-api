import { describe, expect, it } from 'vitest';
import { parseLogamMuliaTable } from '../../../src/features/api/prices/logammulia/scrape';

describe('LogamMulia parseLogamMuliaTable', () => {
	const mockJinaOutput = `Title: Harga Emas Hari Ini | Logam Mulia

URL Source: https://www.logammulia.com/harga-emas-hari-ini

Markdown Content:
[](https://www.logammulia.com/harga-emas-hari-ini)

Hello!

Apa yang ingin Anda cari?

## Harga Emas Hari Ini, 30 Jun 2026

Harga di-update setiap hari pkl. 08.30 WIB

| Berat | Harga Dasar | Harga (+Pajak PPh 0.25%) |
| --- | --- | --- |
| Emas Batangan |
| 0.5 gr | 1,365,000 | 1,368,413 |
| 1 gr | 2,630,000 | 2,636,575 |
| 2 gr | 5,200,000 | 5,213,000 |
| 3 gr | 7,775,000 | 7,793,188 |
| 5 gr | 12,925,000 | 12,957,313 |
| 10 gr | 25,795,000 | 25,859,488 |
| 25 gr | 64,362,000 | 64,522,905 |
| 50 gr | 128,645,000 | 128,966,613 |
| 100 gr | 257,212,000 | 257,855,030 |
| 250 gr | 642,765,000 | 644,371,913 |
| 500 gr | 1,285,320,000 | 1,288,533,300 |
| 1000 gr | 2,570,600,000 | 2,577,026,500 |
| Emas Batangan Gift Series |
| 0.5 gr | 1,435,000 | 1,438,594 |
| 1 gr | 2,780,000 | 2,786,950 |
| Emas Batangan Selamat Idul Fitri |
| 5 gr | 13,898,000 | 13,932,745 |
| Emas Batangan Imlek |
| 8 gr | 21,894,800 | 21,949,537 |
| 88 gr | 238,137,600 | 238,733,147 |
| Emas Batangan Batik Seri III |
| 10 gr | 26,800,000 | 26,867,000 |
| 20 gr | 52,800,000 | 52,932,000 |
| Perak Murni |
| 250 gr | 10,225,000 | 10,250,563 |
| 500 gr | 19,650,000 | 19,699,125 |
| Perak Heritage |
| 31.1 gr | 1,770,005 | 1,774,430 |
| 186.6 gr | 9,498,676 | 9,522,412 |
| Perak Heritage Gift |
| 1 oz | 1,770,005 | 1,774,430 |
`;

	it('parses all gold and silver rows (23 items)', () => {
		const rows = parseLogamMuliaTable(mockJinaOutput);
		expect(rows).toHaveLength(23);
	});

	it('parses Emas Batangan 0.5 gr correctly', () => {
		const rows = parseLogamMuliaTable(mockJinaOutput);
		const item = rows.find(
			(r) => r.materialType === 'Emas Batangan' && r.weight === 0.5,
		)!;
		expect(item).toBeDefined();
		expect(item.material).toBe('gold');
		expect(item.sellPrice).toBe(1365000);
		expect(item.buybackPrice).toBeNull();
		expect(item.weightUnit).toBe('gr');
	});

	it('parses Perak Murni 250 gr as silver', () => {
		const rows = parseLogamMuliaTable(mockJinaOutput);
		const item = rows.find(
			(r) => r.materialType === 'Perak Murni' && r.weight === 250,
		)!;
		expect(item).toBeDefined();
		expect(item.material).toBe('silver');
		expect(item.sellPrice).toBe(10225000);
	});

	it('parses Emas Batangan Imlek 88 gr with large price', () => {
		const rows = parseLogamMuliaTable(mockJinaOutput);
		const item = rows.find(
			(r) => r.materialType === 'Emas Batangan Imlek' && r.weight === 88,
		)!;
		expect(item).toBeDefined();
		expect(item.material).toBe('gold');
		expect(item.sellPrice).toBe(238137600);
	});

	it('separates sections correctly (12 Emas Batangan + 2 Gift + 1 Idul Fitri + 2 Imlek + 2 Batik + 2 Perak Murni + 2 Perak Heritage)', () => {
		const rows = parseLogamMuliaTable(mockJinaOutput);
		const counts: Record<string, number> = {};
		for (const r of rows) {
			counts[r.materialType] = (counts[r.materialType] || 0) + 1;
		}
		expect(counts['Emas Batangan']).toBe(12);
		expect(counts['Emas Batangan Gift Series']).toBe(2);
		expect(counts['Emas Batangan Selamat Idul Fitri']).toBe(1);
		expect(counts['Emas Batangan Imlek']).toBe(2);
		expect(counts['Emas Batangan Batik Seri III']).toBe(2);
		expect(counts['Perak Murni']).toBe(2);
		expect(counts['Perak Heritage']).toBe(2);
	});

	it('returns empty array for non-table content', () => {
		const rows = parseLogamMuliaTable('Hello world\nNo table here');
		expect(rows).toHaveLength(0);
	});

	it('returns empty array for table with Liontin only (non-gold/silver)', () => {
		const input = `| Berat | Harga Dasar | Harga (+Pajak) |
| --- | --- | --- |
| Liontin |
| 1 gr | 2,630,000 | 2,636,575 |
| Emas Batangan |
| 0.5 gr | 1,365,000 | 1,368,413 |`;

		const rows = parseLogamMuliaTable(input);
		// Only Emas Batangan should be parsed, not Liontin
		expect(rows).toHaveLength(1);
		expect(rows[0].materialType).toBe('Emas Batangan');
	});
});
