export class Random {
	constructor(
		public a: number,
		public b: number,
		public c: number,
		public d: number
	) {}

	public next() {
		const t = this.b << 9;
		let r = this.b * 5;
		r = ((r << 7) | (r >>> 25)) * 9;
		this.c ^= this.a;
		this.d ^= this.b;
		this.b ^= this.c;
		this.a ^= this.d;
		this.c ^= t;
		this.d = (this.d << 11) | (this.d >>> 21);
		return (r >>> 0) / 4294967296;
	}

	public nextIntInclusive(lowerBound: number, upperBound: number) {
		return Math.floor(this.next() * (upperBound - lowerBound + 1)) + lowerBound;
	}

	public nextStepInclusive(lowerBound: number, upperBound: number, step: number, trimDecimals = 5) {
		// if step is 0, then return lowerBound
		if (step === 0) {
			return lowerBound;
		}

		const untrimmed =
			Math.floor((this.next() * (upperBound - lowerBound + step)) / step) * step + lowerBound;
		return parseFloat(untrimmed.toFixed(trimDecimals));
	}

	static fromString(seed: string) {
		const parts = [
			parseInt(seed.slice(0, seed.length / 4)),
			parseInt(seed.slice(seed.length / 4, seed.length / 2)),
			parseInt(seed.slice(seed.length / 2, (seed.length / 4) * 3)),
			parseInt(seed.slice((seed.length / 4) * 3))
		] as [number, number, number, number];

		return new this(...parts);
	}
}
