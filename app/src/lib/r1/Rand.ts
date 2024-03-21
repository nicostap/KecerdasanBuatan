export function xoshiro128ss(a: number, b: number, c: number, d: number) {
	return function () {
		const t = b << 9;
		let r = b * 5;
		r = ((r << 7) | (r >>> 25)) * 9;
		c ^= a;
		d ^= b;
		b ^= c;
		a ^= d;
		c ^= t;
		d = (d << 11) | (d >>> 21);
		return (r >>> 0) / 4294967296;
	};
}

export const prandom = xoshiro128ss(1, 2, 3, 4);

export function randomInteger(lowerBound: number, upperBound: number) {
	return Math.floor(prandom() * (upperBound - lowerBound + 1)) + lowerBound;
}
