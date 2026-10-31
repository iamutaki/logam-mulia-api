import { describe, expect, it } from 'vitest';
import { pluangPostProcess } from '../../../src/features/api/prices/pluang/config';

const validPayload = {
	statusCode: 200,
	data: {
		currency: 'IDR',
		current: {
			midPrice: 2304140,
			sell: 2352527,
			buy: 2255753,
			installment: 2352527,
			updated_at: '2026-10-31T04:36:42.532+00:00',
		},
	},
};

describe('pluang pluangPostProcess', () => {
	it('maps current sell/buy to hargaJual/hargaBeli', () => {
		expect(pluangPostProcess(validPayload)).toEqual({
			hargaJual: '2352527',
			hargaBeli: '2255753',
		});
	});

	it('throws when statusCode is not 200', () => {
		expect(() =>
			pluangPostProcess({ ...validPayload, statusCode: 500 }),
		).toThrow(/statusCode 500/);
	});

	it('throws when current is missing', () => {
		expect(() =>
			pluangPostProcess({ statusCode: 200, data: { currency: 'IDR' } }),
		).toThrow(/Invalid Pluang gold prices/);
	});

	it('throws when sell is zero', () => {
		expect(() =>
			pluangPostProcess({
				statusCode: 200,
				data: { current: { sell: 0, buy: 2255753 } },
			}),
		).toThrow(/Invalid Pluang gold prices/);
	});

	it('throws when buy is missing', () => {
		expect(() =>
			pluangPostProcess({
				statusCode: 200,
				data: { current: { sell: 2352527 } },
			}),
		).toThrow(/Invalid Pluang gold prices/);
	});
});
