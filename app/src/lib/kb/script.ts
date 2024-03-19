import { generateDijkstra, generateTSP } from './libs';

export class Barang {
	constructor(
		public dimensix: number,
		public dimensiy: number,
		public dimensiz: number,
		public berat: number,
		public kota_tujuan: number,
		public id: number
	) {}

	getVolume() {
		return this.dimensix * this.dimensiy * this.dimensiz;
	}
}

export const items = [
	new Barang(1.0, 1.0, 1.0, 2.0, 2, 1),
	new Barang(1.0, 5.0, 3.0, 3.0, 1, 2),
	new Barang(2.0, 4.0, 2.0, 4.0, 2, 3),
	new Barang(1.0, 4.0, 3.0, 3.0, 4, 4),
	new Barang(3.0, 1.0, 1.0, 2.0, 3, 5),
	new Barang(3.0, 5.0, 2.0, 1.0, 1, 6),
	new Barang(4.0, 4.0, 3.0, 2.0, 2, 7),
	new Barang(3.0, 3.0, 2.0, 3.0, 4, 8),
	new Barang(3.0, 1.0, 1.0, 2.0, 3, 9),
	new Barang(3.0, 5.0, 2.0, 1.0, 5, 10),
	new Barang(4.0, 4.0, 2.0, 2.0, 2, 11),
	new Barang(3.0, 3.0, 2.0, 1.5, 4, 12),
	new Barang(1.0, 1.0, 1.0, 2.0, 1, 13),
	new Barang(1.0, 5.0, 3.0, 3.0, 3, 14),
	new Barang(2.0, 2.0, 2.0, 4.0, 1, 15)
];

export class Chrosmosome {
	static dimensix = 5.0;
	static dimensiy = 5.0;
	static dimensiz = 6.0;
	static daya_angkut = 50.0;
	static fuel_ratio = 0.2;
	static packing_f = 0.5;

	static upahPerKM = 50000;
	static rasioBensinPerKM = 1.0 / 10.0;
	static hargaBensin = 25000;

	static batasDimensiKecil = 5.0;
	static batasDimensiMenengah = 20.0;

	static hargaKecil = 10000;
	static hargaMenengah = 20000;
	static hargaBesar = 30000;

	public preMutatedState: number[] | null = null;
	public parentChromosomes: Chrosmosome[] = [];

	fitness: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	routes: any[];

	static getBatasVolume() {
		return Chrosmosome.dimensix * Chrosmosome.dimensiy * Chrosmosome.dimensiz;
	}

	constructor(public data: number[]) {
		this.fitness = 0;
		this.routes = [];
	}
	cekMuat() {
		const isi: number[][] = [[], [], [], []];
		for (let i = 0; i < this.data.length; i++) {
			isi[this.data[i]].push(i);
		}
		for (let i = 0; i < 4; i++) {
			let total_isi = 0.0;
			let total_berat = 0.0;
			for (let j = 0; j < isi[i].length; j++) {
				total_isi += items[isi[i][j]].getVolume();
				total_berat += items[isi[i][j]].berat;
			}
			if (
				total_isi > Chrosmosome.getBatasVolume() * Chrosmosome.packing_f ||
				total_berat > Chrosmosome.daya_angkut
			)
				return false;
		}
		return true;
	}

	setFitness() {
		const isi: number[][] = [[], [], [], []];
		for (let i = 0; i < this.data.length; i++) {
			isi[this.data[i]].push(i);
		}
		let jarak = 0;
		this.fitness = 0;
		this.routes = [];

		for (let i = 0; i < 4; i++) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const tujuan: any[] = [];
			for (let j = 0; j < isi[i].length; j++) {
				let harga = items[isi[i][j]].berat * dijkstraMap[0][items[isi[i][j]].kota_tujuan];
				if (items[isi[i][j]].getVolume() <= Chrosmosome.batasDimensiKecil) {
					harga *= Chrosmosome.hargaKecil;
				} else if (items[isi[i][j]].getVolume() <= Chrosmosome.batasDimensiMenengah) {
					harga *= Chrosmosome.hargaMenengah;
				} else {
					harga *= Chrosmosome.hargaBesar;
				}
				this.fitness += harga;

				if (items[isi[i][j]].kota_tujuan == 0) continue;
				if (!tujuan.includes(items[isi[i][j]].kota_tujuan))
					tujuan.push(items[isi[i][j]].kota_tujuan);
			}
			const hasil = generateTSP(dijkstraMap, tujuan);
			this.routes.push(hasil[0]);
			jarak += hasil[1];
		}
		this.fitness -=
			jarak * (Chrosmosome.upahPerKM + Chrosmosome.rasioBensinPerKM * Chrosmosome.hargaBensin);
	}
}

export function compareByFitness(a: Chrosmosome, b: Chrosmosome) {
	return a.fitness - b.fitness;
}

const city_map = [
	[0, 61, 35, 0, 91, 12],
	[61, 0, 0, 0, 0, 90],
	[35, 0, 0, 100, 41, 0],
	[0, 0, 100, 0, 23, 54],
	[91, 0, 41, 23, 0, 0],
	[12, 90, 0, 54, 0, 0]
];
const dijkstraMap = generateDijkstra(city_map);
