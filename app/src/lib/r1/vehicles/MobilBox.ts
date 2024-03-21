import type { Barang } from '../Barang';
import { AbstractDeliveryVehicle } from './AbstractDeliveryVehicle';

export class MobilBox extends AbstractDeliveryVehicle {
	constructor(
		public capacityWidth: number,
		public capacityHeight: number,
		public capacityDepth: number,
		public capacityWeight: number,

		public packingFactor: number,

		public pricePerKm: number,
		public fuelRatio: number,
		public fuelPricePerLiter: number
	) {
		super();
	}

	private getCapacityVolume() {
		return this.capacityWidth * this.capacityHeight * this.capacityDepth;
	}

	private getFuelPrice(distanceKm: number) {
		return distanceKm * this.fuelRatio * this.fuelPricePerLiter;
	}

	public getCost(distanceKm: number) {
		return this.getFuelPrice(distanceKm) + this.pricePerKm * distanceKm;
	}

	public getFitScore(items: Barang[]) {
		let totalVolume = 0;
		let totalWeight = 0;

		for (const item of items) {
			totalVolume += item.getVolume();
			totalWeight += item.weight;
		}

		// return should be 0 if the items fit, and a negative number if the items don't fit proportionally to how much they don't fit.
		const volumeScore = totalVolume / this.getCapacityVolume();
		const weightScore = totalWeight / this.capacityWeight;

		const overloadScore = Math.max(volumeScore, weightScore);

		// If the items fit, return 0.
		if (overloadScore <= 1) {
			return 0;
		}

		// If the items don't fit, return a negative number that represents how much the vehicle can't fit the items.
		return -overloadScore;
	}
}
