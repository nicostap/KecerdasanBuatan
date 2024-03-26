export class VehicleLoad {

	constructor(
		public width: number,
		public height: number,
		public depth: number,
		public weight: number,
		// public originCity: number,
		public destinationCity: number,
	) {}

	public copy() {
		return new VehicleLoad(
			this.width,
			this.height,
			this.depth,
			this.weight,
			// this.originCity,
			this.destinationCity
		);
	}

	public getVolume() {
		return this.width * this.height * this.depth;
	}

	public getWeight() {
		return this.weight;
	}
}
