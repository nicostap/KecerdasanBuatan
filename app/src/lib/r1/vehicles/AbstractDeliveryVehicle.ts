import type { Barang } from '../Barang';

export abstract class AbstractDeliveryVehicle {
	/**
	 * If the vehicle can fit the items, return a 0.
	 * If the vehicle can't fit the items, return a negative number that represents how much the vehicle can't fit the items.
	 */
	abstract getFitScore(items: Barang[]): number;

	/**
	 * Get the cost of using the vehicle to deliver the items.
	 * @param distanceKm The distance in kilometers.
	 * @param travelTimeSeconds The travel time in seconds.
	 */
	abstract getCost(distanceKm: number, travelTimeSeconds: number): number;
}
