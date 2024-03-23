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

const now = Date.now();
const r = () => Math.random();
export let prandom = xoshiro128ss(now * r(), now * r(), now * r(), now * r());

export function setRandomSeed(s1: number, s2: number, s3: number, s4: number) {
	prandom = xoshiro128ss(s1, s2, s3, s4);
}

export function randomInteger(lowerBound: number, upperBound: number) {
	return Math.floor(prandom() * (upperBound - lowerBound + 1)) + lowerBound;
}

export function randomStep(lowerBound: number, upperBound: number, step: number) {
	return Math.floor((prandom() * (upperBound - lowerBound)) / step) * step + lowerBound;
}
