import { generateTSP } from '$lib/kb/libs';
import type { VehicleLoad } from '../VehicleLoad';
import { AbstractDeliveryVehicle } from './AbstractDeliveryVehicle';

export class MobilBox extends AbstractDeliveryVehicle {
	constructor(
		public capacityWidth: number,
		public capacityHeight: number,
		public capacityDepth: number,
		public capacityWeight: number,

		public packingFactor: number,

		public pricePerKm: number,
		public fuelConsumptionPerKm: number,
		public fuelPricePerLiter: number
	) {
		super();
	}

	public copy() {
		return new MobilBox(
			this.capacityWidth,
			this.capacityHeight,
			this.capacityDepth,
			this.capacityWeight,
			this.packingFactor,
			this.pricePerKm,
			this.fuelConsumptionPerKm,
			this.fuelPricePerLiter
		);
	}

	private getCapacityVolume() {
		return this.capacityWidth * this.capacityHeight * this.capacityDepth;
	}

	private getFuelPrice(distanceKm: number) {
		return distanceKm * this.fuelConsumptionPerKm * this.fuelPricePerLiter;
	}

	public getCost(distanceKm: number) {
		return this.getFuelPrice(distanceKm) + this.pricePerKm * distanceKm;
	}

	public getFitScore(items: VehicleLoad[]) {
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

	public getProfitScore(items: VehicleLoad[], map: number[][]) {
		let profit = 0;
		let destinations: number[] = [];

		for (const item of items) {
			let price = item.weight * map[item.originCity][item.destinationCity];
			if (item.getVolume() <= 300) {
				price *= 0.5;
			} else if (item.getVolume() <= 600) {
				price *= 0.75;
			} else {
				price *= 1.0;
			}
			profit += price;

			// If destination is equal to headquarter
			if (item.destinationCity == 0) continue;

			if (!destinations.includes(item.destinationCity))
				destinations.push(item.destinationCity);
		}
		let result = generateTSP(map, destinations);

		// result[0] contains route, result[1] contains distance
		return profit - result[1] * (this.pricePerKm + this.fuelConsumptionPerKm * this.fuelPricePerLiter);
	}
}
