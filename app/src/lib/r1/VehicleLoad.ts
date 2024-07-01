import type { ClassProperties } from '$lib/TypeUtils';
export class VehicleLoad {
	constructor(
		public width: number,
		public height: number,
		public depth: number,
		public weight: number,
		public originCity: number,
		public destinationCity: number,
		// public status: string,
		public mustDeliver = false,

		public id?: number
	) {}

	public copy() {
		return new VehicleLoad(
			this.width,
			this.height,
			this.depth,
			this.weight,
			this.originCity,
			this.destinationCity,
			// this.status,
			this.mustDeliver
		);
	}

	public getVolume() {
		return this.width * this.height * this.depth;
	}

	public getWeight() {
		return this.weight;
	}

	public static fromObject(obj: ClassProperties<VehicleLoad>) {
		return new VehicleLoad(
			obj.width,
			obj.height,
			obj.depth,
			obj.weight,
			obj.originCity,
			obj.destinationCity,
			// obj.status,
			obj.mustDeliver,
			obj.id
		);
	}

	public toObject() {
		return {
			width: this.width,
			height: this.height,
			depth: this.depth,
			weight: this.weight,
			originCity: this.originCity,
			destinationCity: this.destinationCity,
			// status: this.status,
			mustDeliver: this.mustDeliver,
			id: this.id
		};
	}

	public toDatabaseObject() {
		return {
			width: this.width,
			height: this.height,
			depth: this.depth,
			weight: this.weight,
			origin_city: this.originCity,
			dest_city: this.destinationCity,
			// status: this.status,
			must_deliver: this.mustDeliver,
			id: this.id
		};
	}

	public static fromDatabaseObject(obj: Record<string, never>) {
		return new VehicleLoad(
			obj.width,
			obj.height,
			obj.depth,
			obj.weight,
			obj.origin_city,
			obj.dest_city,
			// obj.status,
			obj.must_deliver,
			obj.id
		);
	}
}
