import type { ClassProperties } from '$lib/TypeUtils';
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
		public fuelPricePerLiter: number,

		public id?: number
	) {
		super();
	}

	public static fromObject(obj: ClassProperties<MobilBox>) {
		return new MobilBox(
			obj.capacityWidth,
			obj.capacityHeight,
			obj.capacityDepth,
			obj.capacityWeight,
			obj.packingFactor,
			obj.pricePerKm,
			obj.fuelConsumptionPerKm,
			obj.fuelPricePerLiter,
			obj.id
		);
	}

	public toObject() {
		return {
			id: this.id,
			capacityWidth: this.capacityWidth,
			capacityHeight: this.capacityHeight,
			capacityDepth: this.capacityDepth,
			capacityWeight: this.capacityWeight,
			packingFactor: this.packingFactor,
			pricePerKm: this.pricePerKm,
			fuelConsumptionPerKm: this.fuelConsumptionPerKm,
			fuelPricePerLiter: this.fuelPricePerLiter
		};
	}

	public toDatabaseObject() {
		return {
			id: this.id,
			cap_width: this.capacityWidth,
			cap_height: this.capacityHeight,
			cap_depth: this.capacityDepth,
			cap_weight: this.capacityWeight,
			packing_factor: this.packingFactor,
			price_per_km: this.pricePerKm,
			fuel_consumpt_per_km: this.fuelConsumptionPerKm,
			fuel_price_per_liter: this.fuelPricePerLiter
		};
	}

	public static fromDatabaseObject(obj: Record<string, number>) {
		return new MobilBox(
			obj.cap_width,
			obj.cap_height,
			obj.cap_depth,
			obj.cap_weight,
			obj.packing_factor,
			obj.price_per_km,
			obj.fuel_consumpt_per_km,
			obj.fuel_price_per_liter,
			obj.id
		);
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
		if (overloadScore <= 1.0) {
			return 0;
		}

		// If the items don't fit, return a negative number that represents how much the vehicle can't fit the items.
		return -overloadScore;
	}

	public getProfitScore(items: VehicleLoad[], map: number[][], pathMap: number[][][]) {
		let profit = 0;
		const destinations: number[] = [];

		for (const item of items) {
			let price = item.weight * map[1][item.destinationCity - 1];
			if (item.getVolume() < 1000) {
				price *= 100;
			} else if (item.getVolume() < 4000) {
				price *= 150;
			} else {
				price *= 200;
			}
			profit += price;

			// If destination is equal to headquarter
			if (item.destinationCity == 0) continue;

			if (!destinations.includes(item.destinationCity)) destinations.push(item.destinationCity);
		}
		const result = generateTSP(map, destinations, pathMap);

		return {
			route: result.route,
			profit:
				profit -
				result.dist * (this.pricePerKm + this.fuelConsumptionPerKm * this.fuelPricePerLiter),
			income: profit,
			outcome: result.dist * (this.pricePerKm + this.fuelConsumptionPerKm * this.fuelPricePerLiter)
		};
	}
}
