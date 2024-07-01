export class VehicleLoad {
	
	constructor(
		public width: number,
		public height: number,
		public depth: number,
		public weight: number,
		public originCity: number,
		public destinationCity: number,
		public status: string,
		public mustDeliver = false
	) {}

	public copy() {
		return new VehicleLoad(
			this.width,
			this.height,
			this.depth,
			this.weight,
			this.originCity,
			this.destinationCity,
			this.status,
			this.mustDeliver
		);
	}

	public getVolume() {
		return this.width * this.height * this.depth;
	}

	public getWeight() {
		return this.weight;
	}
}
