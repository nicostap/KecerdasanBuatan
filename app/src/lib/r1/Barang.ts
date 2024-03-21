export class Barang {
	constructor(
		public width: number,
		public height: number,
		public depth: number,
		public weight: number,
		public destinationCity: number,
		public id: number
	) {}

	public getVolume() {
		return this.width * this.height * this.depth;
	}

	public getWeight() {
		return this.weight;
	}
}
