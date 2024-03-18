import type { Barang } from './Barang';

export class MobilBox {
	constructor(
		public capacityWidth: number,
		public capacityHeight: number,
		public capacityDepth: number,
		public capacityWeight: number,

		public packingFactor: number,

		public pricePerKm: number,
		public fuelRatio: number,
		public fuelPricePerLiter: number
	) {}

	public getCapacityVolume() {
		return this.capacityWidth * this.capacityHeight * this.capacityDepth;
	}

	private getFuelPrice(distanceKm: number) {
		return distanceKm * this.fuelRatio * this.fuelPricePerLiter;
	}

	public getCost(distanceKm: number) {
		return this.getFuelPrice(distanceKm) + this.pricePerKm * distanceKm;
	}

	public checkFit(items: Barang[]) {
		let totalVolume = 0;
		let totalWeight = 0;

		for (const item of items) {
			totalVolume += item.getVolume();
			totalWeight += item.weight;
		}
		return totalVolume <= this.getCapacityVolume() && totalWeight <= this.capacityWeight;
	}
}
